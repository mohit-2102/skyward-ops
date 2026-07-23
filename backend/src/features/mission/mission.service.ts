import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateMissionInput,
  UpdateMissionInput,
  QueryMissionInput,
} from './mission.validation';
import { toMissionResponse, toMissionResponses } from './mission.mapper';
import {
  MissionResponse,
  PaginatedMissionsResponse,
  MissionStatsResponse,
} from './mission.types';
import { AppError } from '../../middleware/errorHandler';

function buildWhereClause(query: QueryMissionInput): Prisma.MissionWhereInput {
  const where: Prisma.MissionWhereInput = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.droneId) {
    where.droneId = query.droneId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.from || query.to) {
    where.plannedStartAt = {};
    if (query.from) {
      where.plannedStartAt.gte = query.from;
    }
    if (query.to) {
      where.plannedStartAt.lte = query.to;
    }
  }

  return where;
}

function buildOrderBy(query: QueryMissionInput): Prisma.MissionOrderByWithRelationInput {
  const { sortBy, sortOrder } = query;

  if (sortBy === 'plannedStartAt') {
    return { plannedStartAt: sortOrder };
  }

  return { [sortBy]: sortOrder };
}

async function verifyDroneExists(droneId: string): Promise<void> {
  const drone = await prisma.drone.findUnique({
    where: { id: droneId },
    select: { id: true },
  });
  if (!drone) {
    throw new AppError('Drone not found', 404, 'DRONE_NOT_FOUND');
  }
}

async function verifyMissionExists(id: string): Promise<void> {
  const mission = await prisma.mission.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!mission) {
    throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | Prisma.DbNull {
  if (value === null || value === undefined) {
    return Prisma.DbNull;
  }
  return value as Prisma.InputJsonValue;
}

export const missionService = {
  async getAll(query: QueryMissionInput): Promise<PaginatedMissionsResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = buildWhereClause(query);
    const orderBy = buildOrderBy(query);

    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        where,
        include: { drone: true },
        orderBy,
        skip,
        take,
      }),
      prisma.mission.count({ where }),
    ]);

    return {
      data: toMissionResponses(missions),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getById(id: string): Promise<MissionResponse> {
    const mission = await prisma.mission.findUnique({
      where: { id },
      include: { drone: true },
    });

    if (!mission) {
      throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
    }

    return toMissionResponse(mission);
  },

  async getActive(): Promise<MissionResponse[]> {
    const missions = await prisma.mission.findMany({
      where: { status: 'ACTIVE' },
      include: { drone: true },
      orderBy: { actualStartAt: 'asc' },
    });

    return toMissionResponses(missions);
  },

  async getCompleted(query: QueryMissionInput): Promise<PaginatedMissionsResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.MissionWhereInput = {
      status: 'COMPLETED',
    };

    if (query.droneId) {
      where.droneId = query.droneId;
    }

    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        where,
        include: { drone: true },
        orderBy: { completedAt: 'desc' },
        skip,
        take,
      }),
      prisma.mission.count({ where }),
    ]);

    return {
      data: toMissionResponses(missions),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getByDrone(droneId: string, query: QueryMissionInput): Promise<PaginatedMissionsResponse> {
    await verifyDroneExists(droneId);

    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.MissionWhereInput = {
      droneId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.plannedStartAt = {};
      if (query.from) {
        where.plannedStartAt.gte = query.from;
      }
      if (query.to) {
        where.plannedStartAt.lte = query.to;
      }
    }

    const orderBy = buildOrderBy(query);

    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        where,
        include: { drone: true },
        orderBy,
        skip,
        take,
      }),
      prisma.mission.count({ where }),
    ]);

    return {
      data: toMissionResponses(missions),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async create(data: CreateMissionInput): Promise<MissionResponse> {
    await verifyDroneExists(data.droneId);

    const mission = await prisma.mission.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        droneId: data.droneId,
        status: data.status,
        plannedStartAt: data.plannedStartAt ?? null,
        plannedRoute: toJsonValue(data.plannedRoute),
        actualRoute: Prisma.DbNull,
        waypoints: toJsonValue(data.waypoints),
      } as Prisma.MissionCreateInput,
      include: { drone: true },
    });

    return toMissionResponse(mission);
  },

  async update(id: string, data: UpdateMissionInput): Promise<MissionResponse> {
    await verifyMissionExists(id);

    if (data.droneId) {
      await verifyDroneExists(data.droneId);
    }

    const updateData: Prisma.MissionUpdateInput = {
      name: data.name,
      description: data.description ?? undefined,
      drone: data.droneId ? { connect: { id: data.droneId } } : undefined,
      status: data.status,
      plannedStartAt: data.plannedStartAt ?? undefined,
      actualStartAt: data.actualStartAt ?? undefined,
      completedAt: data.completedAt ?? undefined,
      plannedRoute: toJsonValue(data.plannedRoute),
      actualRoute: toJsonValue(data.actualRoute),
      waypoints: toJsonValue(data.waypoints),
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof Prisma.MissionUpdateInput] === undefined) {
        delete updateData[key as keyof Prisma.MissionUpdateInput];
      }
    });

    const mission = await prisma.mission.update({
      where: { id },
      data: updateData,
      include: { drone: true },
    });

    return toMissionResponse(mission);
  },

  async start(id: string): Promise<MissionResponse> {
    const mission = await prisma.mission.findUnique({
      where: { id },
      include: { drone: true },
    });

    if (!mission) {
      throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
    }

    if (mission.status !== 'PLANNED') {
      throw new AppError('Can only start a PLANNED mission', 400, 'INVALID_STATUS_TRANSITION');
    }

    const updatedMission = await prisma.mission.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        actualStartAt: new Date(),
      },
      include: { drone: true },
    });

    return toMissionResponse(updatedMission);
  },

  async complete(id: string): Promise<MissionResponse> {
    const mission = await prisma.mission.findUnique({
      where: { id },
      include: { drone: true },
    });

    if (!mission) {
      throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
    }

    if (mission.status !== 'ACTIVE') {
      throw new AppError('Can only complete an ACTIVE mission', 400, 'INVALID_STATUS_TRANSITION');
    }

    const updatedMission = await prisma.mission.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: { drone: true },
    });

    return toMissionResponse(updatedMission);
  },

  async cancel(id: string): Promise<MissionResponse> {
    const mission = await prisma.mission.findUnique({
      where: { id },
      include: { drone: true },
    });

    if (!mission) {
      throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
    }

    if (mission.status === 'COMPLETED') {
      throw new AppError('Cannot cancel a COMPLETED mission', 400, 'INVALID_STATUS_TRANSITION');
    }

    if (mission.status !== 'PLANNED' && mission.status !== 'ACTIVE') {
      throw new AppError('Can only cancel PLANNED or ACTIVE missions', 400, 'INVALID_STATUS_TRANSITION');
    }

    const updatedMission = await prisma.mission.update({
      where: { id },
      data: {
        status: 'ABORTED',
      },
      include: { drone: true },
    });

    return toMissionResponse(updatedMission);
  },

  async delete(id: string): Promise<void> {
    const mission = await prisma.mission.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!mission) {
      throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
    }

    if (mission.status === 'ACTIVE') {
      throw new AppError('Cannot delete an ACTIVE mission', 400, 'MISSION_IN_PROGRESS');
    }

    await prisma.mission.delete({
      where: { id },
    });
  },

  async getStats(): Promise<MissionStatsResponse> {
    const [
      totalMissions,
      planned,
      inProgress,
      completed,
      cancelled,
      durationAgg,
    ] = await Promise.all([
      prisma.mission.count(),
      prisma.mission.count({ where: { status: 'PLANNED' } }),
      prisma.mission.count({ where: { status: 'ACTIVE' } }),
      prisma.mission.count({ where: { status: 'COMPLETED' } }),
      prisma.mission.count({ where: { status: 'ABORTED' } }),
      prisma.mission.aggregate({
        where: {
          status: 'COMPLETED',
          actualStartAt: { not: null },
          completedAt: { not: null },
        },
        _avg: {
          // We'll calculate average duration in minutes
        },
      }),
    ]);

    // Calculate average mission duration manually
    const completedMissions = await prisma.mission.findMany({
      where: {
        status: 'COMPLETED',
        actualStartAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        actualStartAt: true,
        completedAt: true,
      },
    });

    let averageMissionDuration: number | null = null;
    if (completedMissions.length > 0) {
      const totalMs = completedMissions.reduce((sum, m) => {
        const start = m.actualStartAt!.getTime();
        const end = m.completedAt!.getTime();
        return sum + (end - start);
      }, 0);
      averageMissionDuration = Math.round(totalMs / completedMissions.length / 60000); // Convert to minutes
    }

    return {
      totalMissions,
      planned,
      inProgress,
      completed,
      cancelled,
      averageMissionDuration,
    };
  },
};