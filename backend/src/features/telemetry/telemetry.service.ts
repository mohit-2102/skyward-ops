import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateTelemetryInput,
  QueryTelemetryInput,
  HistoryQueryInput,
} from './telemetry.validation';
import {
  toTelemetryResponse,
  toTelemetryResponses,
} from './telemetry.mapper';
import {
  PaginatedTelemetryResponse,
  TelemetryResponse,
  TelemetryHistoryResponse,
  DashboardTelemetryStats,
} from './telemetry.types';
import { AppError } from '../../middleware/errorHandler';

type DroneSnapshotUpdate = {
  batteryLevel: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  recordedAt: Date;
};

function buildWhereClause(query: QueryTelemetryInput): Prisma.TelemetryWhereInput {
  const where: Prisma.TelemetryWhereInput = {};

  if (query.droneId) {
    where.droneId = query.droneId;
  }

  if (query.status) {
    where.drone = { status: query.status };
  }

  if (query.from || query.to) {
    where.recordedAt = {};
    if (query.from) {
      where.recordedAt.gte = query.from;
    }
    if (query.to) {
      where.recordedAt.lte = query.to;
    }
  }

  return where;
}

function buildOrderBy(query: QueryTelemetryInput | HistoryQueryInput): Prisma.TelemetryOrderByWithRelationInput {
  const { sortBy, sortOrder } = query;
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

async function updateDroneSnapshot(droneId: string, data: DroneSnapshotUpdate): Promise<void> {
  await prisma.drone.update({
    where: { id: droneId },
    data: {
      batteryLevel: data.batteryLevel,
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude,
      speed: data.speed,
      heading: data.heading,
      lastSeenAt: data.recordedAt,
    },
  });
}

export const telemetryService = {
  async getAll(query: QueryTelemetryInput): Promise<PaginatedTelemetryResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = buildWhereClause(query);
    const orderBy = buildOrderBy(query);

    const [telemetry, total] = await Promise.all([
      prisma.telemetry.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.telemetry.count({ where }),
    ]);

    return {
      data: toTelemetryResponses(telemetry),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getById(id: string): Promise<TelemetryResponse> {
    const telemetry = await prisma.telemetry.findUnique({
      where: { id },
    });

    if (!telemetry) {
      throw new AppError('Telemetry record not found', 404, 'TELEMETRY_NOT_FOUND');
    }

    return toTelemetryResponse(telemetry);
  },

  async getLatestByDroneId(droneId: string): Promise<TelemetryResponse> {
    await verifyDroneExists(droneId);

    const telemetry = await prisma.telemetry.findFirst({
      where: { droneId },
      orderBy: { recordedAt: 'desc' },
    });

    if (!telemetry) {
      throw new AppError('No telemetry found for this drone', 404, 'TELEMETRY_NOT_FOUND');
    }

    return toTelemetryResponse(telemetry);
  },

  async getHistoryByDroneId(droneId: string, query: HistoryQueryInput): Promise<TelemetryHistoryResponse> {
    await verifyDroneExists(droneId);

    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.TelemetryWhereInput = {
      droneId,
      ...(query.from || query.to
        ? {
            recordedAt: {
              ...(query.from && { gte: query.from }),
              ...(query.to && { lte: query.to }),
            },
          }
        : {}),
    };

    const orderBy = buildOrderBy(query);

    const [telemetry, total] = await Promise.all([
      prisma.telemetry.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.telemetry.count({ where }),
    ]);

    return {
      data: toTelemetryResponses(telemetry),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async create(data: CreateTelemetryInput): Promise<TelemetryResponse> {
    await verifyDroneExists(data.droneId);

    const recordedAt = data.recordedAt ?? new Date();

    const telemetry = await prisma.$transaction(async (tx) => {
      const created = await tx.telemetry.create({
        data: {
          droneId: data.droneId,
          batteryLevel: data.batteryLevel,
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude,
          speed: data.speed,
          heading: data.heading,
          temperature: data.temperature ?? null,
          humidity: data.humidity ?? null,
          windSpeed: data.windSpeed ?? null,
          signalStrength: data.signalStrength ?? null,
          gpsAccuracy: data.gpsAccuracy ?? null,
          recordedAt,
        },
      });

      await tx.drone.update({
        where: { id: data.droneId },
        data: {
          batteryLevel: data.batteryLevel,
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude,
          speed: data.speed,
          heading: data.heading,
          lastSeenAt: recordedAt,
        },
      });

      return created;
    });

    return toTelemetryResponse(telemetry);
  },

  async delete(id: string): Promise<void> {
    try {
      await prisma.telemetry.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Telemetry record not found', 404, 'TELEMETRY_NOT_FOUND');
      }
      throw error;
    }
  },

  async getStats(): Promise<DashboardTelemetryStats> {
    const [totalRecords, latestRecord, aggregates] = await Promise.all([
      prisma.telemetry.count(),
      prisma.telemetry.findFirst({
        orderBy: { recordedAt: 'desc' },
        select: { recordedAt: true },
      }),
      prisma.telemetry.aggregate({
        _avg: {
          batteryLevel: true,
          speed: true,
        },
        _max: {
          altitude: true,
        },
      }),
    ]);

    return {
      totalRecords,
      latestRecordedAt: latestRecord?.recordedAt ?? null,
      averageBatteryLevel: aggregates._avg.batteryLevel ?? null,
      averageSpeed: aggregates._avg.speed ?? null,
      maximumAltitude: aggregates._max.altitude ?? null,
    };
  },
};