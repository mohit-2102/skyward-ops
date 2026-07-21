import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { CreateDroneInput, UpdateDroneInput, QueryDroneInput } from './drone.validation';
import { toDroneResponse, toDroneResponses } from './drone.mapper';
import { PaginatedDronesResponse, DroneResponse } from './drone.types';
import { AppError } from '../../middleware/errorHandler';

function buildWhereClause(query: QueryDroneInput): Prisma.DroneWhereInput {
  const where: Prisma.DroneWhereInput = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { serialNumber: { contains: query.search, mode: 'insensitive' } },
      { model: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.manufacturer) {
    where.manufacturer = { name: { contains: query.manufacturer, mode: 'insensitive' } };
  }

  return where;
}

function buildOrderBy(query: QueryDroneInput): Prisma.DroneOrderByWithRelationInput {
  const { sortBy, sortOrder } = query;

  if (sortBy === 'manufacturer') {
    return {
      manufacturer: {
        name: sortOrder,
      },
    };
  }

  return {
    [sortBy]: sortOrder,
  };
}

export const droneService = {
  async getAll(query: QueryDroneInput): Promise<PaginatedDronesResponse> {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = buildWhereClause(query);
    const orderBy = buildOrderBy(query);

    const [drones, total] = await Promise.all([
      prisma.drone.findMany({
        where,
        include: { manufacturer: true },
        orderBy,
        skip,
        take,
      }),
      prisma.drone.count({ where }),
    ]);

    return {
      data: toDroneResponses(drones),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getById(id: string): Promise<DroneResponse> {
    const drone = await prisma.drone.findUnique({
      where: { id },
      include: { manufacturer: true },
    });

    if (!drone) {
      throw new AppError('Drone not found', 404, 'DRONE_NOT_FOUND');
    }

    return toDroneResponse(drone);
  },

  async create(data: CreateDroneInput): Promise<DroneResponse> {
    const existingDrone = await prisma.drone.findUnique({
      where: { serialNumber: data.serialNumber },
    });

    if (existingDrone) {
      throw new AppError('Drone with this serial number already exists', 409, 'DUPLICATE_SERIAL_NUMBER');
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: data.manufacturerId },
    });

    if (!manufacturer) {
      throw new AppError('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
    }

    const drone = await prisma.drone.create({
      data: {
        serialNumber: data.serialNumber,
        name: data.name,
        model: data.model,
        manufacturerId: data.manufacturerId,
        status: data.status,
        firmwareVersion: data.firmwareVersion,
        batteryLevel: data.batteryLevel,
        batteryHealth: data.batteryHealth,
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        speed: data.speed,
        heading: data.heading,
        payloadCapacity: data.payloadCapacity,
        camera: data.camera,
        weight: data.weight,
        maxFlightTime: data.maxFlightTime,
        maxSpeed: data.maxSpeed,
      },
      include: { manufacturer: true },
    });

    return toDroneResponse(drone);
  },

  async update(id: string, data: UpdateDroneInput): Promise<DroneResponse> {
    const existingDrone = await prisma.drone.findUnique({
      where: { id },
      include: { manufacturer: true },
    });

    if (!existingDrone) {
      throw new AppError('Drone not found', 404, 'DRONE_NOT_FOUND');
    }

    if (data.manufacturerId && data.manufacturerId !== existingDrone.manufacturerId) {
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { id: data.manufacturerId },
      });

      if (!manufacturer) {
        throw new AppError('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
      }
    }

    const drone = await prisma.drone.update({
      where: { id },
      data: {
        name: data.name,
        model: data.model,
        manufacturerId: data.manufacturerId,
        status: data.status,
        firmwareVersion: data.firmwareVersion,
        batteryLevel: data.batteryLevel,
        batteryHealth: data.batteryHealth,
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude,
        speed: data.speed,
        heading: data.heading,
        payloadCapacity: data.payloadCapacity,
        camera: data.camera,
        weight: data.weight,
        maxFlightTime: data.maxFlightTime,
        maxSpeed: data.maxSpeed,
      },
      include: { manufacturer: true },
    });

    return toDroneResponse(drone);
  },

  async delete(id: string): Promise<void> {
    const existingDrone = await prisma.drone.findUnique({
      where: { id },
    });

    if (!existingDrone) {
      throw new AppError('Drone not found', 404, 'DRONE_NOT_FOUND');
    }

    await prisma.drone.delete({
      where: { id },
    });
  },
};