import { MaintenanceRecord, Drone, DroneStatus } from '@prisma/client';
import { MaintenanceResponse } from './maintenance.types';

export type MaintenanceWithDrone = MaintenanceRecord & {
  drone: {
    id: string;
    serialNumber: string;
    name: string;
    model: string;
    status: DroneStatus;
  };
};

export function toMaintenanceResponse(record: MaintenanceWithDrone): MaintenanceResponse {
  return {
    id: record.id,
    droneId: record.droneId,
    drone: {
      id: record.drone.id,
      serialNumber: record.drone.serialNumber,
      name: record.drone.name,
      model: record.drone.model,
      status: record.drone.status,
    },
    type: record.type,
    status: record.status,
    description: record.description,
    performedBy: record.performedBy,
    cost: record.cost,
    scheduledAt: record.scheduledAt,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    nextDueAt: record.nextDueAt,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toMaintenanceResponses(records: MaintenanceWithDrone[]): MaintenanceResponse[] {
  return records.map(toMaintenanceResponse);
}