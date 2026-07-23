import { Request, Response } from 'express';
import { telemetryService } from './telemetry.service';
import {
  CreateTelemetryInput,
  QueryTelemetryInput,
  TelemetryIdParam,
  DroneTelemetryParam,
  HistoryQueryInput,
} from './telemetry.validation';
import { ValidatedRequest } from '../../middleware/validation';

export const telemetryController = {
  async getAll(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as QueryTelemetryInput;
    const result = await telemetryService.getAll(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getById(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as TelemetryIdParam;
    const telemetry = await telemetryService.getById(id);
    res.status(200).json({
      success: true,
      data: telemetry,
    });
  },

  async getLatestByDroneId(req: ValidatedRequest, res: Response) {
    const { droneId } = req.validatedParams as DroneTelemetryParam;
    const telemetry = await telemetryService.getLatestByDroneId(droneId);
    res.status(200).json({
      success: true,
      data: telemetry,
    });
  },

  async getHistoryByDroneId(req: ValidatedRequest, res: Response) {
    const { droneId } = req.validatedParams as DroneTelemetryParam;
    const query = req.validatedQuery as HistoryQueryInput;
    const result = await telemetryService.getHistoryByDroneId(droneId, query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async create(req: ValidatedRequest, res: Response) {
    const data = req.validatedBody as CreateTelemetryInput;
    const telemetry = await telemetryService.create(data);
    res.status(201).json({
      success: true,
      data: telemetry,
    });
  },

  async delete(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as TelemetryIdParam;
    await telemetryService.delete(id);
    res.status(204).send();
  },

  async getStats(req: ValidatedRequest, res: Response) {
    const stats = await telemetryService.getStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  },
};