import { Telemetry, Drone } from '@prisma/client';

export interface TelemetryResponse {
  id: string;
  droneId: string;
  batteryLevel: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  signalStrength: number | null;
  gpsAccuracy: number | null;
  recordedAt: Date;
}

export interface PaginatedTelemetryResponse {
  data: TelemetryResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export type TelemetryHistoryResponse = PaginatedTelemetryResponse;

export interface DashboardTelemetryStats {
  totalRecords: number;
  latestRecordedAt: Date | null;
  averageBatteryLevel: number | null;
  averageSpeed: number | null;
  maximumAltitude: number | null;
}