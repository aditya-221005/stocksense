import { apiFetch } from './api';
import { DashboardSummary } from '../types';

export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    return await apiFetch<DashboardSummary>('/dashboard');
  }
}
