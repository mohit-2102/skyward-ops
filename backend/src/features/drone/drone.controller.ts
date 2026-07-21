import { Request, Response } from 'express';
import { droneService } from './drone.service';
import { CreateDroneInput, UpdateDroneInput, QueryDroneInput, DroneIdParam } from './drone.validation';

export const droneController = {
  async getAll(req: Request, res: Response) {
    const query = req.query as unknown as QueryDroneInput;
    const result = await droneService.getAll(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params as DroneIdParam;
    const drone = await droneService.getById(id);
    res.status(200).json({
      success: true,
      data: drone,
    });
  },

  async create(req: Request, res: Response) {
    const data = req.body as CreateDroneInput;
    const drone = await droneService.create(data);
    res.status(201).json({
      success: true,
      data: drone,
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params as DroneIdParam;
    const data = req.body as UpdateDroneInput;
    const drone = await droneService.update(id, data);
    res.status(200).json({
      success: true,
      data: drone,
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params as DroneIdParam;
    await droneService.delete(id);
    res.status(204).send();
  },
};