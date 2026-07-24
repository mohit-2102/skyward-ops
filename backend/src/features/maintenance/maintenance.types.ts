import { MaintenanceRecord, Drone, DroneStatus, MaintenanceType, MaintenanceStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface MaintenanceResponse {
  id: string;
  droneId: string;
  drone: {
    id: string;
    serialNumber: string;
    name: string;
    model: string;
    status: DroneStatus;
  };
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string | null;
  performedBy: string | null;
  cost: Prisma.Decimal | null;
  scheduledAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  nextDueAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedMaintenanceResponse {
  data: MaintenanceResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface MaintenanceStatsResponse {
  totalRecords: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  totalCost: Prisma.Decimal | null;
}