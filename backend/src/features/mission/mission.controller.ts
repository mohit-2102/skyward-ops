import { Request, Response } from 'express';
import { missionService } from './mission.service';
import {
  CreateMissionInput,
  UpdateMissionInput,
  QueryMissionInput,
  MissionIdParam,
  DroneIdParam,
} from './mission.validation';
import { ValidatedRequest } from '../../middleware/validation';

export const missionController = {
  async getAll(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as QueryMissionInput;
    const result = await missionService.getAll(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getActive(req: ValidatedRequest, res: Response) {
    const missions = await missionService.getActive();
    res.status(200).json({
      success: true,
      data: missions,
    });
  },

  async getCompleted(req: ValidatedRequest, res: Response) {
    const query = req.validatedQuery as QueryMissionInput;
    const result = await missionService.getCompleted(query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getByDrone(req: ValidatedRequest, res: Response) {
    const { droneId } = req.validatedParams as DroneIdParam;
    const query = req.validatedQuery as QueryMissionInput;
    const result = await missionService.getByDrone(droneId, query);
    res.status(200).json({
      success: true,
      ...result,
    });
  },

  async getStats(req: ValidatedRequest, res: Response) {
    const stats = await missionService.getStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  },

  async getById(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MissionIdParam;
    const mission = await missionService.getById(id);
    res.status(200).json({
      success: true,
      data: mission,
    });
  },

  async create(req: ValidatedRequest, res: Response) {
    const data = req.validatedBody as CreateMissionInput;
    const mission = await missionService.create(data);
    res.status(201).json({
      success: true,
      data: mission,
    });
  },

  async update(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MissionIdParam;
    const data = req.validatedBody as UpdateMissionInput;
    const mission = await missionService.update(id, data);
    res.status(200).json({
      success: true,
      data: mission,
    });
  },

  async start(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MissionIdParam;
    const mission = await missionService.start(id);
    res.status(200).json({
      success: true,
      data: mission,
    });
  },

  async complete(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MissionIdParam;
    const mission = await missionService.complete(id);
    res.status(200).json({
      success: true,
      data: mission,
    });
  },

  async cancel(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MissionIdParam;
    const mission = await missionService.cancel(id);
    res.status(200).json({
      success: true,
      data: mission,
    });
  },

  async delete(req: ValidatedRequest, res: Response) {
    const { id } = req.validatedParams as MissionIdParam;
    await missionService.delete(id);
    res.status(204).send();
  },
};