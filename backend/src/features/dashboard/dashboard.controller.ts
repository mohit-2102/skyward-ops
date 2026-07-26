import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { DashboardQueryInput } from './dashboard.validation';
import { ValidatedRequest } from '../../middleware/validation';

export const dashboardController = {
  async getOverview(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as DashboardQueryInput;
    const result = await dashboardService.getOverview(query);
    res.status(200).json({ success: true, data: result });
  },

  async getFleet(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as DashboardQueryInput;
    const result = await dashboardService.getFleet(query);
    res.status(200).json({ success: true, ...result });
  },

  async getMap(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as DashboardQueryInput;
    const result = await dashboardService.getMap(query);
    res.status(200).json({ success: true, data: result });
  },

  async getActivity(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as DashboardQueryInput;
    const result = await dashboardService.getActivity(query);
    res.status(200).json({ success: true, ...result });
  },

  async getHealth(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as DashboardQueryInput;
    const result = await dashboardService.getHealth(query);
    res.status(200).json({ success: true, data: result });
  },

  async getMissions(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as DashboardQueryInput;
    const result = await dashboardService.getMissions(query);
    res.status(200).json({ success: true, data: result });
  },

  async getMaintenance(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as DashboardQueryInput;
    const result = await dashboardService.getMaintenance(query);
    res.status(200).json({ success: true, data: result });
  },

  async getAlerts(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as DashboardQueryInput;
    const result = await dashboardService.getAlerts(query);
    res.status(200).json({ success: true, data: result });
  },

  async getTelemetry(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as DashboardQueryInput;
    const result = await dashboardService.getTelemetry(query);
    res.status(200).json({ success: true, data: result });
  },
};