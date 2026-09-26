import React, { useEffect, useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { ProductService } from "../services/product.service";
import { Product, ProductCategory, UnitOfMeasure } from "../types";
import { products as mockProducts } from "../data/mockData";

export const ProductsPage: React.FC = () => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    uomId: "",
    unitCost: 0,
    initialStock: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedProducts, fetchedCategories, fetchedUoms] = await Promise.all([
        ProductService.getProducts(),
        ProductService.getCategories(),
        ProductService.getUoms(),
      ]);
      setProductsList(fetchedProducts);
      setCategories(fetchedCategories);
      setUoms(fetchedUoms);
    } catch {
      setProductsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      setModalError("Product Name and SKU are required.");
      return;
    }

    try {
      setSubmitting(true);
      setModalError("");
      const selectedUomId = formData.uomId || (uoms[0]?.id || "uom-unit");
      await ProductService.createProduct({
        name: formData.name,
        sku: formData.sku,
        categoryId: formData.categoryId || undefined,
        uomId: selectedUomId,
        unitCost: Number(formData.unitCost),
        initialStock: Number(formData.initialStock),
      });

      setIsModalOpen(false);
      setFormData({
        name: "",
        sku: "",
        categoryId: "",
        uomId: "",
        unitCost: 0,
        initialStock: 0,
      });
      await loadData();
    } catch (err: any) {
      setModalError(err.message || "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const totalQty = product.quantity !== undefined
      ? product.quantity
      : (product.stockBalances?.reduce((sum, b) => sum + Number(b.onHand), 0) ?? 0);

    const calculatedStatus = product.status || (
      totalQty === 0 ? "Out of Stock" : totalQty <= (product.minStock || 10) ? "Low Stock" : "In Stock"
    );

    const matchesStatus = statusFilter === "All" || calculatedStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Inventory & Products
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Manage product master catalog, SKUs, categories, and stock availability.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-cyan-500 transition-all duration-200"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-card rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-xl flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search product name or SKU code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all duration-200"
        >
          <option value="All">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {/* Product Table */}
      <div className="glass-card overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-slate-800/80 bg-slate-950/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Product Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Unit Cost
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/50">
              {filteredProducts.map((product) => {
                const totalQty = product.quantity !== undefined
                  ? product.quantity
                  : (product.stockBalances?.reduce((sum, b) => sum + Number(b.onHand), 0) ?? 0);

                const categoryName = typeof product.category === 'object' && product.category !== null
                  ? product.category.name
                  : (product.category || 'General');

                const supplierName = typeof product.supplier === 'object' && product.supplier !== null
                  ? product.supplier.name
                  : (product.supplier || 'TechSupply');

                const priceVal = product.price ?? product.unitCost ?? 0;
                const statusStr = product.status || (
                  totalQty === 0 ? "Out of Stock" : totalQty <= (product.minStock || 10) ? "Low Stock" : "In Stock"
                );

                return (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-100">{product.name}</p>
                        <p className="text-xs font-mono text-cyan-400 mt-0.5">{product.sku}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-300">
                      {categoryName}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-300">
                      {supplierName}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-100">
                        {totalQty} {product.uom?.symbol || 'pcs'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Min: {product.minStock || 10}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-emerald-400">
                      ₹{priceVal.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold inline-block border ${
                          statusStr === "In Stock"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : statusStr === "Low Stock"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {statusStr}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    {loading ? "Loading products..." : "No products found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Add New Product</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-400 border border-rose-500/30 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Ergonomic Mouse"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">SKU Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PROD-MOUSE-02"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                    className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Initial Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950/90 p-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 transition-all duration-200"
                >
                  {submitting ? "Saving..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
