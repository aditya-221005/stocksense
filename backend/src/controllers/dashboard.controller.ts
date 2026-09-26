import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/async-handler.js';

export class DashboardController {
  static getSummary = asyncHandler(async (_req: Request, res: Response) => {
    const summary = await DashboardService.getSummary();
    res.json(summary);
  });
}
