import { Drone, Manufacturer } from '@prisma/client';
import { DroneResponse } from './drone.types';

export function toDroneResponse(drone: Drone & { manufacturer: Manufacturer }): DroneResponse {
  return {
    id: drone.id,
    serialNumber: drone.serialNumber,
    name: drone.name,
    model: drone.model,
    manufacturerId: drone.manufacturerId,
    manufacturer: {
      id: drone.manufacturer.id,
      name: drone.manufacturer.name,
      country: drone.manufacturer.country,
      website: drone.manufacturer.website,
    },
    status: drone.status,
    firmwareVersion: drone.firmwareVersion,
    batteryLevel: drone.batteryLevel,
    batteryHealth: drone.batteryHealth,
    latitude: drone.latitude,
    longitude: drone.longitude,
    altitude: drone.altitude,
    speed: drone.speed,
    heading: drone.heading,
    payloadCapacity: drone.payloadCapacity,
    camera: drone.camera,
    weight: drone.weight,
    maxFlightTime: drone.maxFlightTime,
    maxSpeed: drone.maxSpeed,
    lastSeenAt: drone.lastSeenAt,
    createdAt: drone.createdAt,
    updatedAt: drone.updatedAt,
  };
}

export function toDroneResponses(drones: (Drone & { manufacturer: Manufacturer })[]): DroneResponse[] {
  return drones.map(toDroneResponse);
}