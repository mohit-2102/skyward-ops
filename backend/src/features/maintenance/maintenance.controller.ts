import { Request, Response } from 'express';
import { maintenanceService } from './maintenance.service';
import {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  QueryMaintenanceInput,
  MaintenanceIdParam,
  DroneIdParam,
} from './maintenance.validation';
import { ValidatedRequest } from '../../middleware/validation';

export const maintenanceController = {
  async getAll(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as QueryMaintenanceInput;
    const result = await maintenanceService.getAll(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getById(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MaintenanceIdParam;
    const record = await maintenanceService.getById(id);
    res.status(200).json({
      success: true,
      data: record,
    });
  },

  async getByDrone(req: ValidatedRequest, res: Response) {
    const { droneId } = req.validatedParams as DroneIdParam;
    const query = req.validatedQuery as QueryMaintenanceInput;
    const result = await maintenanceService.getByDrone(droneId, query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getUpcoming(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as QueryMaintenanceInput;
    const result = await maintenanceService.getUpcoming(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getOverdue(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as QueryMaintenanceInput;
    const result = await maintenanceService.getOverdue(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getActive(req: ValidatedRequest, res: Response) {
    const records = await maintenanceService.getActive();
    res.status(200).json({
      success: true,
      data: records,
    });
  },

  async getStats(req: ValidatedRequest, res: Response) {
    const stats = await maintenanceService.getStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  },

  async create(req: ValidatedRequest, res: Response) {
    const data = req.validatedBody as CreateMaintenanceInput;
    const record = await maintenanceService.create(data);
    res.status(201).json({
      success: true,
      data: record,
    });
  },

  async update(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MaintenanceIdParam;
    const data = req.validatedBody as UpdateMaintenanceInput;
    const record = await maintenanceService.update(id, data);
    res.status(200).json({
      success: true,
      data: record,
    });
  },

  async start(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MaintenanceIdParam;
    const record = await maintenanceService.start(id);
    res.status(200).json({
      success: true,
      data: record,
    });
  },

  async complete(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MaintenanceIdParam;
    const record = await maintenanceService.complete(id);
    res.status(200).json({
      success: true,
      data: record,
    });
  },

  async cancel(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MaintenanceIdParam;
    const record = await maintenanceService.cancel(id);
    res.status(200).json({
      success: true,
      data: record,
    });
  },

  async delete(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MaintenanceIdParam;
    await maintenanceService.delete(id);
    res.status(204).send();
  },
};