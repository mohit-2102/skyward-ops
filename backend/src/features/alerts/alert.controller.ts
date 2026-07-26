import { Response } from 'express';
import { alertService } from './alert.service';
import {
  CreateAlertInput,
  UpdateAlertInput,
  QueryAlertInput,
  AlertIdParam,
  DroneIdParam,
  SeverityParam,
  TypeParam,
} from './alert.validation';
import { ValidatedRequest } from '../../middleware/validation';

export const alertController = {
  async getAll(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as QueryAlertInput;
    const result = await alertService.getAll(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getById(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as AlertIdParam;
    const alert = await alertService.getById(id);
    res.status(200).json({
      success: true,
      data: alert,
    });
  },

  async getByDrone(req: ValidatedRequest, res: Response) {
    const { droneId } = req.validatedParams as DroneIdParam;
    const query = req.validatedQuery as QueryAlertInput;
    const result = await alertService.getByDrone(droneId, query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getActive(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as QueryAlertInput;
    const result = await alertService.getActive(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getBySeverity(req: ValidatedRequest, res: Response) {
    const { severity } = req.validatedParams as SeverityParam;
    const query = req.validatedQuery as QueryAlertInput;
    const result = await alertService.getBySeverity(severity, query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getByType(req: ValidatedRequest, res: Response) {
    const { type } = req.validatedParams as TypeParam;
    const query = req.validatedQuery as QueryAlertInput;
    const result = await alertService.getByType(type, query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getStats(req: ValidatedRequest, res: Response) {
    const stats = await alertService.getStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  },

  async create(req: ValidatedRequest, res: Response) {
    const data = req.validatedBody as CreateAlertInput;
    const alert = await alertService.create(data);
    res.status(201).json({
      success: true,
      data: alert,
    });
  },

  async update(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as AlertIdParam;
    const data = req.validatedBody as UpdateAlertInput;
    const alert = await alertService.update(id, data);
    res.status(200).json({
      success: true,
      data: alert,
    });
  },

  async acknowledge(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as AlertIdParam;
    const alert = await alertService.acknowledge(id);
    res.status(200).json({
      success: true,
      data: alert,
    });
  },

  async resolve(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as AlertIdParam;
    const alert = await alertService.resolve(id);
    res.status(200).json({
      success: true,
      data: alert,
    });
  },

  async delete(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as AlertIdParam;
    await alertService.delete(id);
    res.status(204).send();
  },
};