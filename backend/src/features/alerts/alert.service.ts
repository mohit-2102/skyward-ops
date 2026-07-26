import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateAlertInput,
  UpdateAlertInput,
  QueryAlertInput,
} from './alert.validation';
import { toAlertResponse, toAlertResponses } from './alert.mapper';
import {
  AlertResponse,
  PaginatedAlertsResponse,
  AlertStatsResponse,
} from './alert.types';
import { AppError } from '../../middleware/errorHandler';

const VALID_LIFECYCLE_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['ACKNOWLEDGED', 'RESOLVED'],
  ACKNOWLEDGED: ['RESOLVED'],
  RESOLVED: [],
};

function buildWhereClause(query: QueryAlertInput): Prisma.AlertWhereInput {
  const where: Prisma.AlertWhereInput = {};

  if (query.search) {
    where.OR = [
      { message: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.droneId) {
    where.droneId = query.droneId;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.severity) {
    where.severity = query.severity;
  }

  if (query.status) {
    if (query.status === 'OPEN') {
      where.acknowledgedAt = null;
      where.resolvedAt = null;
    } else if (query.status === 'ACKNOWLEDGED') {
      where.acknowledgedAt = { not: null };
      where.resolvedAt = null;
    } else if (query.status === 'RESOLVED') {
      where.resolvedAt = { not: null };
    }
  }

  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) {
      where.createdAt.gte = query.from;
    }
    if (query.to) {
      where.createdAt.lte = query.to;
    }
  }

  return where;
}

function buildOrderBy(query: QueryAlertInput): Prisma.AlertOrderByWithRelationInput {
  const { sortBy, sortOrder } = query;

  if (sortBy === 'severity') {
    return { severity: sortOrder };
  }

  if (sortBy === 'status') {
    // For proper lifecycle ordering: OPEN -> ACKNOWLEDGED -> RESOLVED
    return { acknowledgedAt: 'asc' };
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

function validateAlertTransition(currentStatus: string, newStatus: string): void {
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

const alertSelect = {
  id: true,
  droneId: true,
  type: true,
  severity: true,
  message: true,
  metadata: true,
  acknowledgedAt: true,
  acknowledgedBy: true,
  resolvedAt: true,
  resolvedBy: true,
  createdAt: true,
  drone: {
    select: {
      id: true,
      serialNumber: true,
      name: true,
      model: true,
      status: true,
    },
  },
} satisfies Prisma.AlertSelect;

async function createSystemGeneratedAlert(
  droneId: string,
  type: 'LOW_BATTERY' | 'GPS_SIGNAL' | 'COMMUNICATION' | 'SYSTEM' | 'OBSTACLE',
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  message: string,
  metadata?: Record<string, unknown>
): Promise<AlertResponse> {
  await verifyDroneExists(droneId);
  const alert = await prisma.alert.create({
    data: {
      droneId,
      type,
      severity,
      message,
      metadata: toJsonValue(metadata),
    },
    select: alertSelect,
  });
  return toAlertResponse(alert);
}

export const alertService = {
  async getAll(query: QueryAlertInput): Promise<PaginatedAlertsResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = buildWhereClause(query);
    const orderBy = buildOrderBy(query);

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        select: alertSelect,
        orderBy,
        skip,
        take,
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      data: toAlertResponses(alerts),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getById(id: string): Promise<AlertResponse> {
    const alert = await prisma.alert.findUnique({
      where: { id },
      select: alertSelect,
    });

    if (!alert) {
      throw new AppError('Alert not found', 404, 'ALERT_NOT_FOUND');
    }

    return toAlertResponse(alert);
  },

  async getByDrone(droneId: string, query: QueryAlertInput): Promise<PaginatedAlertsResponse> {
    await verifyDroneExists(droneId);

    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = buildWhereClause({
      ...query,
      droneId,
    });
    const orderBy = buildOrderBy(query);

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        select: alertSelect,
        orderBy,
        skip,
        take,
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      data: toAlertResponses(alerts),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getActive(query: QueryAlertInput): Promise<PaginatedAlertsResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const baseWhere = buildWhereClause({
      ...query,
      status: 'OPEN',
    });
    delete baseWhere.acknowledgedAt;
    delete baseWhere.resolvedAt;
    baseWhere.resolvedAt = null;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where: baseWhere,
        select: alertSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.alert.count({ where: baseWhere }),
    ]);

    return {
      data: toAlertResponses(alerts),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getBySeverity(severity: string, query: QueryAlertInput): Promise<PaginatedAlertsResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = buildWhereClause({
      ...query,
      severity: severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    });

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        select: alertSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      data: toAlertResponses(alerts),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getByType(type: string, query: QueryAlertInput): Promise<PaginatedAlertsResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = buildWhereClause({
      ...query,
      type: type as 'LOW_BATTERY' | 'GPS_SIGNAL' | 'COMMUNICATION' | 'SYSTEM' | 'OBSTACLE',
    });

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        select: alertSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      data: toAlertResponses(alerts),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async create(data: CreateAlertInput): Promise<AlertResponse> {
    await verifyDroneExists(data.droneId);

    const alert = await prisma.alert.create({
      data: {
        droneId: data.droneId,
        type: data.type,
        severity: data.severity,
        message: data.message,
        metadata: toJsonValue(data.metadata),
      },
      select: alertSelect,
    });

    return toAlertResponse(alert);
  },

  async update(id: string, data: UpdateAlertInput): Promise<AlertResponse> {
    const updateData: Prisma.AlertUpdateInput = {
      message: data.message ?? undefined,
      metadata: toJsonValue(data.metadata),
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof Prisma.AlertUpdateInput] === undefined) {
        delete updateData[key as keyof Prisma.AlertUpdateInput];
      }
    });

    try {
      const alert = await prisma.alert.update({
        where: { id },
        data: updateData,
        select: alertSelect,
      });
      return toAlertResponse(alert);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Alert not found', 404, 'ALERT_NOT_FOUND');
      }
      throw error;
    }
  },

  async acknowledge(id: string): Promise<AlertResponse> {
    try {
      const updatedAlert = await prisma.alert.update({
        where: {
          id,
          acknowledgedAt: null,
        },
        data: {
          acknowledgedAt: new Date(),
        },
        select: alertSelect,
      });
      return toAlertResponse(updatedAlert);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        const existing = await prisma.alert.findUnique({
          where: { id },
          select: { acknowledgedAt: true, resolvedAt: true },
        });
        if (existing) {
          if (existing.resolvedAt) {
            throw new AppError('Cannot acknowledge a resolved alert', 400, 'INVALID_STATUS_TRANSITION');
          }
          if (existing.acknowledgedAt) {
            throw new AppError('Alert is already acknowledged', 400, 'ALREADY_ACKNOWLEDGED');
          }
        }
        throw new AppError('Alert not found', 404, 'ALERT_NOT_FOUND');
      }
      throw error;
    }
  },

  async resolve(id: string): Promise<AlertResponse> {
    const alert = await prisma.alert.findUnique({
      where: { id },
      select: { id: true, resolvedAt: true },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404, 'ALERT_NOT_FOUND');
    }

    if (alert.resolvedAt) {
      throw new AppError('Alert is already resolved', 400, 'ALREADY_RESOLVED');
    }

    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
      },
      select: alertSelect,
    });
    return toAlertResponse(updatedAlert);
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.alert.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Alert not found', 404, 'ALERT_NOT_FOUND');
      }
      throw error;
    }
  },

  async getStats(): Promise<AlertStatsResponse> {
    const [severityCounts, typeCounts, openCount, ackCount, resolvedCount] = await Promise.all([
      prisma.alert.groupBy({
        by: ['severity'],
        _count: { id: true },
      }),
      prisma.alert.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      prisma.alert.count({ where: { acknowledgedAt: null, resolvedAt: null } }),
      prisma.alert.count({ where: { acknowledgedAt: { not: null }, resolvedAt: null } }),
      prisma.alert.count({ where: { resolvedAt: { not: null } } }),
    ]);

    const severityMap = severityCounts.reduce((acc, curr) => {
      acc[curr.severity] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    const typeMap = typeCounts.reduce((acc, curr) => {
      acc[curr.type] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(severityMap).reduce((sum, count) => sum + count, 0);

    return {
      total,
      open: openCount,
      acknowledged: ackCount,
      resolved: resolvedCount,
      critical: severityMap.CRITICAL || 0,
      high: severityMap.HIGH || 0,
      medium: severityMap.MEDIUM || 0,
      low: severityMap.LOW || 0,
      alertsByType: {
        LOW_BATTERY: typeMap.LOW_BATTERY || 0,
        GPS_SIGNAL: typeMap.GPS_SIGNAL || 0,
        COMMUNICATION: typeMap.COMMUNICATION || 0,
        SYSTEM: typeMap.SYSTEM || 0,
        OBSTACLE: typeMap.OBSTACLE || 0,
      },
      alertsBySeverity: {
        LOW: severityMap.LOW || 0,
        MEDIUM: severityMap.MEDIUM || 0,
        HIGH: severityMap.HIGH || 0,
        CRITICAL: severityMap.CRITICAL || 0,
      },
    };
  },

  async createLowBatteryAlert(droneId: string, batteryLevel: number) {
    return createSystemGeneratedAlert(
      droneId,
      'LOW_BATTERY',
      batteryLevel < 15 ? 'CRITICAL' : batteryLevel < 25 ? 'HIGH' : 'MEDIUM',
      `Drone battery at ${batteryLevel}%`,
      { batteryLevel },
    );
  },

  async createGpsSignalAlert(droneId: string, signalStrength: number) {
    return createSystemGeneratedAlert(
      droneId,
      'GPS_SIGNAL',
      signalStrength < 20 ? 'CRITICAL' : 'HIGH',
      `GPS signal strength at ${signalStrength}%`,
      { signalStrength },
    );
  },

  async createCommunicationAlert(droneId: string, lastContact: Date) {
    const minutesSinceContact = Math.floor((Date.now() - lastContact.getTime()) / 60000);
    return createSystemGeneratedAlert(
      droneId,
      'COMMUNICATION',
      minutesSinceContact > 30 ? 'CRITICAL' : 'HIGH',
      `Communication lost for ${minutesSinceContact} minutes`,
      { lastContact, minutesSinceContact },
    );
  },

  async createSystemAlert(droneId: string, message: string, metadata?: Record<string, unknown>) {
    return createSystemGeneratedAlert(
      droneId,
      'SYSTEM',
      'HIGH',
      message,
      metadata,
    );
  },

  async createObstacleAlert(droneId: string, distance: number) {
    return createSystemGeneratedAlert(
      droneId,
      'OBSTACLE',
      distance < 5 ? 'CRITICAL' : distance < 10 ? 'HIGH' : 'MEDIUM',
      `Obstacle detected at ${distance}m`,
      { distance },
    );
  },

  async createMaintenanceOverdueAlert(droneId: string, daysOverdue: number) {
    return createSystemGeneratedAlert(
      droneId,
      'SYSTEM',
      daysOverdue > 7 ? 'HIGH' : 'MEDIUM',
      `Maintenance overdue by ${daysOverdue} days`,
      { daysOverdue },
    );
  },

  async createMissionFailureAlert(droneId: string, missionId: string, reason: string) {
    return createSystemGeneratedAlert(
      droneId,
      'SYSTEM',
      'HIGH',
      `Mission failed: ${reason}`,
      { missionId, reason },
    );
  },

  async createTelemetryTimeoutAlert(droneId: string, lastTelemetryAt: Date) {
    const minutesSinceTelemetry = Math.floor((Date.now() - lastTelemetryAt.getTime()) / 60000);
    return createSystemGeneratedAlert(
      droneId,
      'COMMUNICATION',
      minutesSinceTelemetry > 15 ? 'CRITICAL' : 'HIGH',
      `No telemetry received for ${minutesSinceTelemetry} minutes`,
      { lastTelemetryAt, minutesSinceTelemetry },
    );
  },
};