import { apiFetch } from './api';
import { Product, ProductCategory, UnitOfMeasure } from '../types';

export class ProductService {
  static async getProducts(params?: { categoryId?: string; search?: string }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.search) query.append('search', params.search);
    const qStr = query.toString() ? `?${query.toString()}` : '';

    return await apiFetch<Product[]>(`/products${qStr}`);
  }

  static async getProductById(id: string): Promise<Product> {
    return await apiFetch<Product>(`/products/${id}`);
  }

  static async createProduct(data: {
    name: string;
    sku: string;
    categoryId?: string;
    uomId: string;
    unitCost: number;
    initialStock?: number;
    defaultWarehouseId?: string;
    defaultLocationId?: string;
  }): Promise<Product> {
    return await apiFetch<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return await apiFetch<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteProduct(id: string): Promise<void> {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
  }

  // Categories & UOMs
  static async getCategories(): Promise<ProductCategory[]> {
    return await apiFetch<ProductCategory[]>('/categories');
  }

  static async createCategory(name: string): Promise<ProductCategory> {
    return await apiFetch<ProductCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  static async getUoms(): Promise<UnitOfMeasure[]> {
    return await apiFetch<UnitOfMeasure[]>('/categories/uom'); // Or /products/uoms
  }
}
