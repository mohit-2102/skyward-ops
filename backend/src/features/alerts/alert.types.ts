import { Alert, Drone, DroneStatus, AlertSeverity, AlertType } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface AlertResponse {
  id: string;
  droneId: string;
  drone: {
    id: string;
    serialNumber: string;
    name: string;
    model: string;
    status: DroneStatus;
  };
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  metadata: Prisma.JsonValue | null;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  createdAt: Date;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface PaginatedAlertsResponse {
  data: AlertResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AlertStatsResponse {
  total: number;
  open: number;
  acknowledged: number;
  resolved: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  alertsByType: Record<AlertType, number>;
  alertsBySeverity: Record<AlertSeverity, number>;
}