import { Mission, Drone, DroneStatus, MissionStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface MissionResponse {
  id: string;
  name: string;
  description: string | null;
  droneId: string;
  drone: {
    id: string;
    serialNumber: string;
    name: string;
    model: string;
    status: DroneStatus;
  };
  status: MissionStatus;
  plannedStartAt: Date | null;
  actualStartAt: Date | null;
  completedAt: Date | null;
  plannedRoute: Prisma.JsonValue | null;
  actualRoute: Prisma.JsonValue | null;
  waypoints: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedMissionsResponse {
  data: MissionResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface MissionStatsResponse {
  totalMissions: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  averageMissionDuration: number | null;
}