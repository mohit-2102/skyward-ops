import { Drone, DroneStatus, MissionStatus, AlertSeverity, AlertType, MaintenanceType, MaintenanceStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

/**
 * Main Dashboard Overview Response
 */
export interface DashboardOverviewResponse {
  totalDrones: number;
  online: number;
  offline: number;
  inFlight: number;
  maintenance: number;
  charging: number;

  totalMissions: number;
  activeMissions: number;
  completedToday: number;

  activeAlerts: number;
  criticalAlerts: number;

  upcomingMaintenance: number;
  overdueMaintenance: number;

  fleetUtilization: number;
  averageBattery: number;
}

/**
 * Fleet Status Card - per drone
 */
export interface FleetDroneResponse {
  id: string;
  serialNumber: string;
  name: string;
  model: string;
  status: DroneStatus;
  battery: number;
  lastTelemetry: Date | null;
  activeMission: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  signalStrength: number | null;
  temperature: number | null;
}

/**
 * Fleet Status Response
 */
export interface DashboardFleetResponse {
  data: FleetDroneResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Map Data Response - latest telemetry per drone for map display
 */
export interface DashboardMapResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  battery: number;
  status: DroneStatus;
  heading: number;
  speed: number;
  activeMission: string | null;
  latestTelemetryAt: Date | null;
}

/**
 * Activity Feed Item Types
 */
export type ActivityType = 'alert' | 'mission' | 'maintenance' | 'telemetry';

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  timestamp: Date;
  droneId: string;
  droneName: string;
  droneSerialNumber: string;
  title: string;
  description: string;
  severity?: AlertSeverity;
  status?: MissionStatus | MaintenanceStatus;
}

/**
 * Activity Feed Response
 */
export interface DashboardActivityResponse {
  data: ActivityFeedItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Fleet Health Metrics
 */
export interface DashboardHealthResponse {
  averageBattery: number;
  averageSignal: number;
  averageTemperature: number | null;
  healthyDrones: number;
  warningDrones: number;
  criticalDrones: number;
  offlineDrones: number;
  maintenanceDrones: number;
}

/**
 * Mission Analytics
 */
export interface DashboardMissionsResponse {
  total: number;
  planned: number;
  active: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  averageMissionDuration: number | null;
  missionsToday: number;
  missionsThisWeek: number;
  missionsThisMonth: number;
}

/**
 * Maintenance Analytics
 */
export interface DashboardMaintenanceResponse {
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  upcoming: number;
  totalCost: Prisma.Decimal | null;
  averageCost: Prisma.Decimal | null;
  maintenanceThisMonth: number;
}

/**
 * Alert Analytics
 */
export interface DashboardAlertsResponse {
  open: number;
  acknowledged: number;
  resolved: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  alertsByType: Record<AlertType, number>;
  alertsLast24Hours: number;
  alertsThisWeek: number;
}

/**
 * Telemetry Analytics
 */
export interface DashboardTelemetryResponse {
  averageBattery: number;
  minimumBattery: number;
  maximumBattery: number;
  averageTemperature: number | null;
  averageAltitude: number | null;
  averageSpeed: number | null;
  averageSignalStrength: number | null;
  dronesReporting: number;
  lastTelemetryReceived: Date | null;
}

/**
 * Time range filter for queries
 */
export interface TimeRangeFilter {
  from?: Date;
  to?: Date;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Common dashboard query filters
 */
export interface DashboardQueryFilters extends TimeRangeFilter, PaginationParams {
  droneId?: string;
  status?: DroneStatus | MissionStatus | MaintenanceStatus | string;
  type?: AlertType | MaintenanceType | string;
}

export type DashboardQueryInput = DashboardQueryFilters;

// Re-export Prisma enums for convenience
export { DroneStatus, MissionStatus, AlertSeverity, AlertType, MaintenanceType, MaintenanceStatus };