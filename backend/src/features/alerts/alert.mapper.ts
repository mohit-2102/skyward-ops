import { Alert, Drone, DroneStatus } from '@prisma/client';
import { AlertResponse } from './alert.types';

export type AlertWithDrone = Alert & {
  drone: {
    id: string;
    serialNumber: string;
    name: string;
    model: string;
    status: DroneStatus;
  };
};

export function getAlertStatus(alert: Pick<Alert, 'acknowledgedAt' | 'resolvedAt'>): 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' {
  if (alert.resolvedAt) return 'RESOLVED';
  if (alert.acknowledgedAt) return 'ACKNOWLEDGED';
  return 'OPEN';
}

export function toAlertResponse(alert: Alert & { drone: { id: string; serialNumber: string; name: string; model: string; status: DroneStatus } }): AlertResponse {
  return {
    id: alert.id,
    droneId: alert.droneId,
    drone: {
      id: alert.drone.id,
      serialNumber: alert.drone.serialNumber,
      name: alert.drone.name,
      model: alert.drone.model,
      status: alert.drone.status,
    },
    type: alert.type,
    severity: alert.severity,
    message: alert.message,
    metadata: alert.metadata,
    acknowledgedAt: alert.acknowledgedAt,
    acknowledgedBy: alert.acknowledgedBy,
    resolvedAt: alert.resolvedAt,
    resolvedBy: alert.resolvedBy,
    createdAt: alert.createdAt,
    status: getAlertStatus(alert),
  };
}

export function toAlertResponses(alerts: (Alert & { drone: { id: string; serialNumber: string; name: string; model: string; status: DroneStatus } })[]): AlertResponse[] {
  return alerts.map(toAlertResponse);
}