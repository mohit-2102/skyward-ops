import { Request, Response } from 'express';
import { droneService } from './drone.service';
import { CreateDroneInput, UpdateDroneInput, QueryDroneInput, DroneIdParam } from './drone.validation';
import { ValidatedRequest } from '../../middleware/validation';

export const droneController = {
  async getAll(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as QueryDroneInput;
    const result = await droneService.getAll(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getById(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as DroneIdParam;
    const drone = await droneService.getById(id);
    res.status(200).json({
      success: true,
      data: drone,
    });
  },

  async create(req: ValidatedRequest, res: Response) {
    const data = req.validatedBody as CreateDroneInput;
    const drone = await droneService.create(data);
    res.status(201).json({
      success: true,
      data: drone,
    });
  },

  async update(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as DroneIdParam;
    const data = req.validatedBody as UpdateDroneInput;
    const drone = await droneService.update(id, data);
    res.status(200).json({
      success: true,
      data: drone,
    });
  },

  async delete(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as DroneIdParam;
    await droneService.delete(id);
    res.status(204).send();
  },
};