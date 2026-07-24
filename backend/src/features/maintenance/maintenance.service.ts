import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  QueryMaintenanceInput,
} from './maintenance.validation';
import { toMaintenanceResponse, toMaintenanceResponses } from './maintenance.mapper';
import {
  MaintenanceResponse,
  PaginatedMaintenanceResponse,
  MaintenanceStatsResponse,
} from './maintenance.types';
import { AppError } from '../../middleware/errorHandler';

const VALID_LIFECYCLE_TRANSITIONS: Record<string, string[]> = {
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function buildWhereClause(query: QueryMaintenanceInput): Prisma.MaintenanceRecordWhereInput {
  const where: Prisma.MaintenanceRecordWhereInput = {};

  if (query.search) {
    where.OR = [
      { description: { contains: query.search, mode: 'insensitive' } },
      { notes: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.droneId) {
    where.droneId = query.droneId;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.from || query.to) {
    where.scheduledAt = {};
    if (query.from) {
      where.scheduledAt.gte = query.from;
    }
    if (query.to) {
      where.scheduledAt.lte = query.to;
    }
  }

  return where;
}

function buildOrderBy(query: QueryMaintenanceInput): Prisma.MaintenanceRecordOrderByWithRelationInput {
  const { sortBy, sortOrder } = query;

  if (sortBy === 'scheduledAt') {
    return { scheduledAt: sortOrder };
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

async function verifyDroneAvailability(droneId: string, excludeMaintenanceId?: string): Promise<void> {
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
      `Drone is not available for maintenance (status: ${drone.status})`,
      409,
      'DRONE_UNAVAILABLE'
    );
  }

  const activeMaintenance = await prisma.maintenanceRecord.findFirst({
    where: {
      droneId,
      status: 'IN_PROGRESS',
      ...(excludeMaintenanceId ? { id: { not: excludeMaintenanceId } } : {}),
    },
    select: { id: true },
  });

  if (activeMaintenance) {
    throw new AppError(
      'Drone already has an active maintenance job',
      409,
      'DRONE_HAS_ACTIVE_MAINTENANCE'
    );
  }

  const activeMission = await prisma.mission.findFirst({
    where: {
      droneId,
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  if (activeMission) {
    throw new AppError(
      'Drone has an active mission',
      409,
      'DRONE_HAS_ACTIVE_MISSION'
    );
  }
}

function validateMaintenanceTransition(currentStatus: string, newStatus: string): void {
  const allowedTransitions = VALID_LIFECYCLE_TRANSITIONS[currentStatus] || [];
  if (!allowedTransitions.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }
}

const maintenanceSelect = {
  id: true,
  droneId: true,
  type: true,
  status: true,
  description: true,
  performedBy: true,
  cost: true,
  scheduledAt: true,
  startedAt: true,
  completedAt: true,
  nextDueAt: true,
  notes: true,
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
} satisfies Prisma.MaintenanceRecordSelect;

async function startMaintenanceTx(tx: Prisma.TransactionClient, id: string) {
  const record = await tx.maintenanceRecord.findUnique({
    where: { id },
    select: { id: true, status: true, droneId: true },
  });

  if (!record) {
    throw new AppError('Maintenance record not found', 404, 'MAINTENANCE_NOT_FOUND');
  }

  if (record.status !== 'SCHEDULED') {
    throw new AppError('Can only start a SCHEDULED maintenance', 400, 'INVALID_STATUS_TRANSITION');
  }

  await tx.drone.update({
    where: { id: record.droneId },
    data: { status: 'MAINTENANCE' },
  });

  const updatedRecord = await tx.maintenanceRecord.update({
    where: { id },
    data: {
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
    select: maintenanceSelect,
  });

  return toMaintenanceResponse(updatedRecord);
}

async function completeMaintenanceTx(tx: Prisma.TransactionClient, id: string) {
  const record = await tx.maintenanceRecord.findUnique({
    where: { id },
    select: { id: true, status: true, droneId: true, nextDueAt: true },
  });

  if (!record) {
    throw new AppError('Maintenance record not found', 404, 'MAINTENANCE_NOT_FOUND');
  }

  if (record.status !== 'IN_PROGRESS') {
    throw new AppError('Can only complete an IN_PROGRESS maintenance', 400, 'INVALID_STATUS_TRANSITION');
  }

  const now = new Date();
  const nextDue = record.nextDueAt ?? new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  await tx.drone.update({
    where: { id: record.droneId },
    data: {
      status: 'ONLINE',
      lastMaintenanceAt: now,
      nextMaintenanceDue: nextDue,
    },
  });

  const updatedRecord = await tx.maintenanceRecord.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: now,
    },
    select: maintenanceSelect,
  });

  return toMaintenanceResponse(updatedRecord);
}

async function cancelMaintenanceTx(tx: Prisma.TransactionClient, id: string) {
  const record = await tx.maintenanceRecord.findUnique({
    where: { id },
    select: { id: true, status: true, droneId: true },
  });

  if (!record) {
    throw new AppError('Maintenance record not found', 404, 'MAINTENANCE_NOT_FOUND');
  }

  if (record.status === 'COMPLETED') {
    throw new AppError('Cannot cancel a COMPLETED maintenance', 400, 'INVALID_STATUS_TRANSITION');
  }

  if (record.status !== 'SCHEDULED' && record.status !== 'IN_PROGRESS') {
    throw new AppError('Can only cancel SCHEDULED or IN_PROGRESS maintenance', 400, 'INVALID_STATUS_TRANSITION');
  }

  await tx.drone.update({
    where: { id: record.droneId },
    data: { status: 'ONLINE' },
  });

  const updatedRecord = await tx.maintenanceRecord.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
    select: maintenanceSelect,
  });

  return toMaintenanceResponse(updatedRecord);
}

export const maintenanceService = {
  async getAll(query: QueryMaintenanceInput): Promise<PaginatedMaintenanceResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = buildWhereClause(query);
    const orderBy = buildOrderBy(query);

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        select: maintenanceSelect,
        orderBy,
        skip,
        take,
      }),
      prisma.maintenanceRecord.count({ where }),
    ]);

    return {
      data: toMaintenanceResponses(records),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getById(id: string): Promise<MaintenanceResponse> {
    const record = await prisma.maintenanceRecord.findUnique({
      where: { id },
      select: maintenanceSelect,
    });

    if (!record) {
      throw new AppError('Maintenance record not found', 404, 'MAINTENANCE_NOT_FOUND');
    }

    return toMaintenanceResponse(record);
  },

  async getByDrone(droneId: string, query: QueryMaintenanceInput): Promise<PaginatedMaintenanceResponse> {
    await verifyDroneExists(droneId);

    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = buildWhereClause({
      ...query,
      droneId,
    });
    const orderBy = buildOrderBy(query);

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        select: maintenanceSelect,
        orderBy,
        skip,
        take,
      }),
      prisma.maintenanceRecord.count({ where }),
    ]);

    return {
      data: toMaintenanceResponses(records),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getUpcoming(query: QueryMaintenanceInput): Promise<PaginatedMaintenanceResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const where = buildWhereClause({
      ...query,
      status: 'SCHEDULED',
      from: now,
      to: thirtyDaysFromNow,
    });
    const orderBy = buildOrderBy(query);

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        select: maintenanceSelect,
        orderBy,
        skip,
        take,
      }),
      prisma.maintenanceRecord.count({ where }),
    ]);

    return {
      data: toMaintenanceResponses(records),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getOverdue(query: QueryMaintenanceInput): Promise<PaginatedMaintenanceResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const now = new Date();

    const where = buildWhereClause({
      ...query,
      status: 'SCHEDULED',
      to: now,
    });
    const orderBy = buildOrderBy(query);

    const [records, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        select: maintenanceSelect,
        orderBy,
        skip,
        take,
      }),
      prisma.maintenanceRecord.count({ where }),
    ]);

    return {
      data: toMaintenanceResponses(records),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getActive(): Promise<MaintenanceResponse[]> {
    const records = await prisma.maintenanceRecord.findMany({
      where: { status: 'IN_PROGRESS' },
      select: maintenanceSelect,
      orderBy: { startedAt: 'asc' },
    });

    return toMaintenanceResponses(records);
  },

  async create(data: CreateMaintenanceInput): Promise<MaintenanceResponse> {
    await verifyDroneAvailability(data.droneId);

    const record = await prisma.maintenanceRecord.create({
      data: {
        droneId: data.droneId,
        type: data.type,
        status: 'SCHEDULED',
        description: data.description ?? null,
        performedBy: data.performedBy ?? null,
        cost: data.cost ?? null,
        scheduledAt: data.scheduledAt,
        nextDueAt: data.nextDueAt ?? null,
        notes: data.notes ?? null,
      },
      select: maintenanceSelect,
    });

    return toMaintenanceResponse(record);
  },

  async update(id: string, data: UpdateMaintenanceInput): Promise<MaintenanceResponse> {
    const updateData: Prisma.MaintenanceRecordUpdateInput = {
      type: data.type,
      description: data.description ?? undefined,
      performedBy: data.performedBy ?? undefined,
      cost: data.cost ?? undefined,
      scheduledAt: data.scheduledAt ?? undefined,
      nextDueAt: data.nextDueAt ?? undefined,
      notes: data.notes ?? undefined,
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof Prisma.MaintenanceRecordUpdateInput] === undefined) {
        delete updateData[key as keyof Prisma.MaintenanceRecordUpdateInput];
      }
    });

    try {
      const record = await prisma.maintenanceRecord.update({
        where: { id },
        data: updateData,
        select: maintenanceSelect,
      });
      return toMaintenanceResponse(record);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Maintenance record not found', 404, 'MAINTENANCE_NOT_FOUND');
      }
      throw error;
    }
  },

  async start(id: string): Promise<MaintenanceResponse> {
    return prisma.$transaction(async (tx) => {
      return startMaintenanceTx(tx, id);
    });
  },

  async complete(id: string): Promise<MaintenanceResponse> {
    return prisma.$transaction(async (tx) => {
      return completeMaintenanceTx(tx, id);
    });
  },

  async cancel(id: string): Promise<MaintenanceResponse> {
    return prisma.$transaction(async (tx) => {
      return cancelMaintenanceTx(tx, id);
    });
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.maintenanceRecord.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Maintenance record not found', 404, 'MAINTENANCE_NOT_FOUND');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new AppError('Cannot delete maintenance record with related data', 400, 'DELETE_CONSTRAINT_VIOLATION');
      }
      throw error;
    }
  },

  async getStats(): Promise<MaintenanceStatsResponse> {
    const [statusCounts, costAgg, overdueCount] = await Promise.all([
      prisma.maintenanceRecord.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.maintenanceRecord.aggregate({
        _sum: { cost: true },
      }),
      prisma.maintenanceRecord.count({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { lt: new Date() },
        },
      }),
    ]);

    const statusMap = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalRecords = Object.values(statusMap).reduce((sum, count) => sum + count, 0);

    return {
      totalRecords,
      scheduled: statusMap.SCHEDULED || 0,
      inProgress: statusMap.IN_PROGRESS || 0,
      completed: statusMap.COMPLETED || 0,
      cancelled: statusMap.CANCELLED || 0,
      overdue: overdueCount,
      totalCost: costAgg._sum.cost,
    };
  },
};