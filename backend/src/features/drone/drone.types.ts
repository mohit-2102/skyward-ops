import { Drone, Manufacturer, DroneStatus } from '@prisma/client';

export type DroneWithManufacturer = Drone & {
  manufacturer: Manufacturer;
};

export type DroneResponse = {
  id: string;
  serialNumber: string;
  name: string;
  model: string;
  manufacturerId: string;
  manufacturer: {
    id: string;
    name: string;
    country: string | null;
    website: string | null;
  };
  status: DroneStatus;
  firmwareVersion: string | null;
  batteryLevel: number;
  batteryHealth: number | null;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  payloadCapacity: number | null;
  camera: string | null;
  weight: number | null;
  maxFlightTime: number | null;
  maxSpeed: number | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedDronesResponse = {
  data: DroneResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type DroneStatusValue = DroneStatus;