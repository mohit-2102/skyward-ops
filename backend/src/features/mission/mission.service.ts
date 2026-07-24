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

const VALID_LIFECYCLE_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ['ACTIVE', 'ABORTED'],
  ACTIVE: ['COMPLETED', 'ABORTED'],
  COMPLETED: [],
  FAILED: [],
  ABORTED: [],
};

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

async function verifyDroneAvailability(droneId: string, excludeMissionId?: string): Promise<void> {
  const drone = await prisma.drone.findUnique({
    where: { id: droneId },
    select: { id: true, status: true },
  });

  if (!drone) {
    throw new AppError('Drone not found', 404, 'DRONE_NOT_FOUND');
  }

  const unavailableStatuses = ['IN_FLIGHT', 'MAINTENANCE', 'CHARGING'];
  if (unavailableStatuses.includes(drone.status)) {
    throw new AppError(
      `Drone is not available for assignment (status: ${drone.status})`,
      409,
      'DRONE_UNAVAILABLE'
    );
  }

  const activeMission = await prisma.mission.findFirst({
    where: {
      droneId,
      status: 'ACTIVE',
      ...(excludeMissionId ? { id: { not: excludeMissionId } } : {}),
    },
    select: { id: true },
  });

  if (activeMission) {
    throw new AppError(
      'Drone already has an active mission',
      409,
      'DRONE_HAS_ACTIVE_MISSION'
    );
  }
}

function validateMissionTransition(currentStatus: string, newStatus: string): void {
  const allowedTransitions = VALID_LIFECYCLE_TRANSITIONS[currentStatus] || [];
  if (!allowedTransitions.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (value === null || value === undefined) {
    return Prisma.DbNull;
  }
  return value as Prisma.InputJsonValue;
}

const missionSelect = {
  id: true,
  name: true,
  description: true,
  droneId: true,
  status: true,
  plannedStartAt: true,
  actualStartAt: true,
  completedAt: true,
  plannedRoute: true,
  actualRoute: true,
  waypoints: true,
  createdAt: true,
  updatedAt: true,
  drone: {
    select: {
      id: true,
      serialNumber: true,
      name: true,
      model: true,
      status: true,
    },
  },
} satisfies Prisma.MissionSelect;

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
        select: missionSelect,
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
      select: missionSelect,
    });

    if (!mission) {
      throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
    }

    return toMissionResponse(mission);
  },

  async getActive(): Promise<MissionResponse[]> {
    const missions = await prisma.mission.findMany({
      where: { status: 'ACTIVE' },
      select: missionSelect,
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
        select: missionSelect,
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
        select: missionSelect,
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
    await verifyDroneAvailability(data.droneId);

    const mission = await prisma.mission.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        drone: { connect: { id: data.droneId } },
        status: data.status,
        plannedStartAt: data.plannedStartAt ?? null,
        plannedRoute: toJsonValue(data.plannedRoute),
        actualRoute: Prisma.DbNull,
        waypoints: toJsonValue(data.waypoints),
      },
      select: missionSelect,
    });

    return toMissionResponse(mission);
  },

  async update(id: string, data: UpdateMissionInput): Promise<MissionResponse> {
    await verifyMissionExists(id);

    if (data.droneId) {
      await verifyDroneAvailability(data.droneId, id);
    }

    const updateData: Prisma.MissionUpdateInput = {
      name: data.name,
      description: data.description ?? undefined,
      drone: data.droneId ? { connect: { id: data.droneId } } : undefined,
      plannedStartAt: data.plannedStartAt ?? undefined,
      plannedRoute: toJsonValue(data.plannedRoute),
      actualRoute: toJsonValue(data.actualRoute),
      waypoints: toJsonValue(data.waypoints),
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof Prisma.MissionUpdateInput] === undefined) {
        delete updateData[key as keyof Prisma.MissionUpdateInput];
      }
    });

    try {
      const mission = await prisma.mission.update({
        where: { id },
        data: updateData,
        select: missionSelect,
      });
      return toMissionResponse(mission);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
      }
      throw error;
    }
  },

  async start(id: string): Promise<MissionResponse> {
    return prisma.$transaction(async (tx) => {
      const mission = await tx.mission.findUnique({
        where: { id },
        select: { id: true, status: true, droneId: true },
      });

      if (!mission) {
        throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
      }

      validateMissionTransition(mission.status, 'ACTIVE');

      await tx.drone.update({
        where: { id: mission.droneId },
        data: { status: 'IN_FLIGHT' },
      });

      const updatedMission = await tx.mission.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          actualStartAt: new Date(),
        },
        select: missionSelect,
      });

      return toMissionResponse(updatedMission);
    });
  },

  async complete(id: string): Promise<MissionResponse> {
    return prisma.$transaction(async (tx) => {
      const mission = await tx.mission.findUnique({
        where: { id },
        select: { id: true, status: true, droneId: true },
      });

      if (!mission) {
        throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
      }

      validateMissionTransition(mission.status, 'COMPLETED');

      await tx.drone.update({
        where: { id: mission.droneId },
        data: { status: 'ONLINE' },
      });

      const updatedMission = await tx.mission.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        select: missionSelect,
      });

      return toMissionResponse(updatedMission);
    });
  },

  async cancel(id: string): Promise<MissionResponse> {
    return prisma.$transaction(async (tx) => {
      const mission = await tx.mission.findUnique({
        where: { id },
        select: { id: true, status: true, droneId: true },
      });

      if (!mission) {
        throw new AppError('Mission not found', 404, 'MISSION_NOT_FOUND');
      }

      validateMissionTransition(mission.status, 'ABORTED');

      await tx.drone.update({
        where: { id: mission.droneId },
        data: { status: 'ONLINE' },
      });

      const updatedMission = await tx.mission.update({
        where: { id },
        data: {
          status: 'ABORTED',
        },
        select: missionSelect,
      });

      return toMissionResponse(updatedMission);
    });
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
    const statusCounts = await prisma.mission.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusMap = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalMissions = Object.values(statusMap).reduce((sum, count) => sum + count, 0);

    // Calculate average mission duration from completed missions with actual start and end times
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
      averageMissionDuration = Math.round(totalMs / completedMissions.length / 60000);
    }

    return {
      totalMissions,
      planned: statusMap.PLANNED || 0,
      inProgress: statusMap.ACTIVE || 0,
      completed: statusMap.COMPLETED || 0,
      cancelled: statusMap.ABORTED || 0,
      averageMissionDuration,
    };
  },
};