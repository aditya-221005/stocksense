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
      setProductsList(fetchedProducts.length > 0 ? fetchedProducts : mockProducts);
      setCategories(fetchedCategories);
      setUoms(fetchedUoms);
    } catch {
      setProductsList(mockProducts);
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
    <div className="p-2 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Inventory & Products
          </h2>
          <p className="mt-1 text-slate-500">
            Manage your product catalog, categories, and stock levels.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition"
        >
          <option value="All">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {/* Product Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Supplier / Vendor
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Price / Cost
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
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
                  <tr key={product.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{product.name}</p>
                        <p className="text-xs font-mono text-slate-400">{product.sku}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {categoryName}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {supplierName}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {totalQty} {product.uom?.symbol || ''}
                      </p>
                      <p className="text-xs text-slate-400">
                        Min: {product.minStock || 10}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      ₹{priceVal.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold inline-block ${
                          statusStr === "In Stock"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : statusStr === "Low Stock"
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : "bg-red-50 text-red-700 border border-red-200"
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
                    className="px-5 py-10 text-center text-sm text-slate-500"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Product</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Mouse"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">SKU</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WM-001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">Initial Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
