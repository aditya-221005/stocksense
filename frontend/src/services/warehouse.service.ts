import { apiFetch } from './api';
import { Warehouse, Location } from '../types';

export class WarehouseService {
  static async getWarehouses(): Promise<Warehouse[]> {
    return await apiFetch<Warehouse[]>('/warehouses');
  }

  static async getWarehouseById(id: string): Promise<Warehouse> {
    return await apiFetch<Warehouse>(`/warehouses/${id}`);
  }

  static async createWarehouse(data: { name: string; shortCode: string; address?: string }): Promise<Warehouse> {
    return await apiFetch<Warehouse>('/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getLocations(warehouseId?: string): Promise<Location[]> {
    const qStr = warehouseId ? `?warehouseId=${warehouseId}` : '';
    return await apiFetch<Location[]>(`/locations${qStr}`);
  }

  static async createLocation(data: {
    name: string;
    shortCode: string;
    warehouseId: string;
    parentId?: string;
  }): Promise<Location> {
    return await apiFetch<Location>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
