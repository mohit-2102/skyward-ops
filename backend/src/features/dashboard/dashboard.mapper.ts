import { Prisma } from '@prisma/client';
import {
  DashboardOverviewResponse,
  FleetDroneResponse,
  DashboardMapResponse,
  ActivityFeedItem,
  DashboardHealthResponse,
  DashboardMissionsResponse,
  DashboardMaintenanceResponse,
  DashboardAlertsResponse,
  DashboardTelemetryResponse,
  DroneStatus,
  AlertSeverity,
  AlertType,
  MaintenanceStatus,
  MissionStatus,
  ActivityType,
} from './dashboard.types';

/**
 * Map drone with latest telemetry to fleet response
 */
export function toFleetDroneResponse(drone: {
  id: string;
  serialNumber: string;
  name: string;
  model: string;
  status: DroneStatus;
  batteryLevel: number;
  lastSeenAt: Date | null;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  signalStrength: number | null;
  temperature: number | null;
  activeMission: { id: string; name: string; status: MissionStatus } | null;
}): FleetDroneResponse {
  return {
    id: drone.id,
    serialNumber: drone.serialNumber,
    name: drone.name,
    model: drone.model,
    status: drone.status,
    battery: drone.batteryLevel,
    lastTelemetry: drone.lastSeenAt,
    activeMission: drone.activeMission?.name ?? null,
    location: drone.latitude !== 0 && drone.longitude !== 0
      ? { latitude: drone.latitude, longitude: drone.longitude }
      : null,
    signalStrength: drone.signalStrength,
    temperature: drone.temperature,
  };
}

/**
 * Map drone with latest telemetry to map response
 */
export function toMapDroneResponse(drone: {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  status: DroneStatus;
  heading: number;
  speed: number;
  lastSeenAt: Date | null;
  activeMission: { id: string; name: string; status: MissionStatus } | null;
}): DashboardMapResponse {
  return {
    id: drone.id,
    name: drone.name,
    latitude: drone.latitude,
    longitude: drone.longitude,
    battery: drone.batteryLevel,
    status: drone.status,
    heading: drone.heading,
    speed: drone.speed,
    activeMission: drone.activeMission?.name ?? null,
    latestTelemetryAt: drone.lastSeenAt,
  };
}

/**
 * Map alerts to activity feed items
 */
export function toAlertActivityItems(alerts: Array<{
  id: string;
  createdAt: Date;
  droneId: string;
  drone: { name: string; serialNumber: string };
  type: AlertType;
  severity: AlertSeverity;
  message: string;
}>): ActivityFeedItem[] {
  return alerts.map(alert => ({
    id: alert.id,
    type: 'alert' as ActivityType,
    timestamp: alert.createdAt,
    droneId: alert.droneId,
    droneName: alert.drone.name,
    droneSerialNumber: alert.drone.serialNumber,
    title: `Alert: ${alert.type}`,
    description: alert.message,
    severity: alert.severity,
  }));
}

/**
 * Map missions to activity feed items
 */
export function toMissionActivityItems(missions: Array<{
  id: string;
  createdAt: Date;
  actualStartAt: Date | null;
  completedAt: Date | null;
  droneId: string;
  drone: { name: string; serialNumber: string };
  name: string;
  status: MissionStatus;
}>): ActivityFeedItem[] {
  return missions.map(mission => {
    let title = 'Mission';
    let description = mission.name;
    let timestamp = mission.createdAt;

    if (mission.status === 'ACTIVE' && mission.actualStartAt) {
      title = 'Mission Started';
      timestamp = mission.actualStartAt;
    } else if (mission.status === 'COMPLETED' && mission.completedAt) {
      title = 'Mission Completed';
      timestamp = mission.completedAt;
    } else if (mission.status === 'ABORTED') {
      title = 'Mission Aborted';
    } else if (mission.status === 'FAILED') {
      title = 'Mission Failed';
    }

    return {
      id: mission.id,
      type: 'mission' as ActivityType,
      timestamp,
      droneId: mission.droneId,
      droneName: mission.drone.name,
      droneSerialNumber: mission.drone.serialNumber,
      title,
      description,
      status: mission.status,
    };
  });
}

/**
 * Map maintenance records to activity feed items
 */
export function toMaintenanceActivityItems(records: Array<{
  id: string;
  createdAt: Date;
  scheduledAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  droneId: string;
  drone: { name: string; serialNumber: string };
  type: string;
  status: MaintenanceStatus;
  description: string | null;
}>): ActivityFeedItem[] {
  return records.map(record => {
    let title = 'Maintenance';
    let description = record.description ?? record.type;
    let timestamp = record.createdAt;

    if (record.status === 'IN_PROGRESS' && record.startedAt) {
      title = 'Maintenance Started';
      timestamp = record.startedAt;
    } else if (record.status === 'COMPLETED' && record.completedAt) {
      title = 'Maintenance Completed';
      timestamp = record.completedAt;
    } else if (record.status === 'SCHEDULED') {
      title = 'Maintenance Scheduled';
      timestamp = record.scheduledAt;
    } else if (record.status === 'CANCELLED') {
      title = 'Maintenance Cancelled';
    }

    return {
      id: record.id,
      type: 'maintenance' as ActivityType,
      timestamp,
      droneId: record.droneId,
      droneName: record.drone.name,
      droneSerialNumber: record.drone.serialNumber,
      title,
      description,
      status: record.status,
    };
  });
}

/**
 * Sort activity items by timestamp descending (newest first)
 */
export function sortActivityItems(items: ActivityFeedItem[]): ActivityFeedItem[] {
  return [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Paginate activity items
 */
export function paginateActivityItems(
  items: ActivityFeedItem[],
  page: number,
  pageSize: number
): { data: ActivityFeedItem[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } } {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: items.slice(start, end),
    pagination: {
      page,
      pageSize,
      total: items.length,
      totalPages: Math.ceil(items.length / pageSize),
    },
  };
}

/**
 * Calculate fleet health category counts
 */
export function calculateHealthCategories(
  drones: Array<{
    id: string;
    status: DroneStatus;
    batteryLevel: number;
    signalStrength: number | null;
  }>
): {
  healthy: number;
  warning: number;
  critical: number;
  offline: number;
  maintenance: number;
} {
  let healthy = 0;
  let warning = 0;
  let critical = 0;
  let offline = 0;
  let maintenance = 0;

  for (const drone of drones) {
    if (drone.status === 'OFFLINE') {
      offline++;
    } else if (drone.status === 'MAINTENANCE') {
      maintenance++;
    } else if (drone.status === 'CHARGING') {
      healthy++;
    } else {
      const battery = drone.batteryLevel;
      const signal = drone.signalStrength ?? 100;

      if (battery < 20 || signal < 20) {
        critical++;
      } else if (battery < 50 || signal < 50) {
        warning++;
      } else {
        healthy++;
      }
    }
  }

  return { healthy, warning, critical, offline, maintenance };
}

/**
 * Build dashboard overview response from aggregated data
 */
export function buildDashboardOverview(
  droneStats: {
    total: number;
    online: number;
    offline: number;
    inFlight: number;
    maintenance: number;
    charging: number;
    avgBattery: number;
  },
  missionStats: {
    total: number;
    active: number;
    completedToday: number;
  },
  alertStats: {
    active: number;
    critical: number;
  },
  maintenanceStats: {
    upcoming: number;
    overdue: number;
  },
  fleetUtilization: number
): DashboardOverviewResponse {
  return {
    totalDrones: droneStats.total,
    online: droneStats.online,
    offline: droneStats.offline,
    inFlight: droneStats.inFlight,
    maintenance: droneStats.maintenance,
    charging: droneStats.charging,

    totalMissions: missionStats.total,
    activeMissions: missionStats.active,
    completedToday: missionStats.completedToday,

    activeAlerts: alertStats.active,
    criticalAlerts: alertStats.critical,

    upcomingMaintenance: maintenanceStats.upcoming,
    overdueMaintenance: maintenanceStats.overdue,

    fleetUtilization,
    averageBattery: Math.round(droneStats.avgBattery),
  };
}

/**
 * Build fleet health response from aggregated data
 */
export function buildDashboardHealth(
  drones: Array<{
    id: string;
    status: DroneStatus;
    batteryLevel: number;
    signalStrength: number | null;
    temperature: number | null;
  }>
): DashboardHealthResponse {
  const categories = calculateHealthCategories(
    drones.map(d => ({
      id: d.id,
      status: d.status,
      batteryLevel: d.batteryLevel,
      signalStrength: d.signalStrength,
    }))
  );

  const reportingDrones = drones.filter(d => d.status !== 'OFFLINE' && d.status !== 'MAINTENANCE');

  const avgBattery = reportingDrones.length > 0
    ? reportingDrones.reduce((sum, d) => sum + d.batteryLevel, 0) / reportingDrones.length
    : 0;

  const avgSignal = reportingDrones.length > 0
    ? reportingDrones.reduce((sum, d) => sum + (d.signalStrength ?? 100), 0) / reportingDrones.length
    : 100;

  const temps = reportingDrones.filter(d => d.temperature !== null).map(d => d.temperature!);
  const avgTemperature = temps.length > 0
    ? temps.reduce((sum, t) => sum + t, 0) / temps.length
    : null;

  return {
    averageBattery: Math.round(avgBattery * 10) / 10,
    averageSignal: Math.round(avgSignal * 10) / 10,
    averageTemperature: avgTemperature !== null ? Math.round(avgTemperature * 10) / 10 : null,
    healthyDrones: categories.healthy,
    warningDrones: categories.warning,
    criticalDrones: categories.critical,
    offlineDrones: categories.offline,
    maintenanceDrones: categories.maintenance,
  };
}

/**
 * Build mission analytics response
 */
export function buildDashboardMissions(
  statusCounts: Record<string, number>,
  totalMissions: number,
  avgDuration: number | null,
  todayCount: number,
  weekCount: number,
  monthCount: number
): DashboardMissionsResponse {
  const completed = statusCounts.COMPLETED || 0;
  const completionRate = totalMissions > 0 ? Math.round((completed / totalMissions) * 100) : 0;

  return {
    total: totalMissions,
    planned: statusCounts.PLANNED || 0,
    active: statusCounts.ACTIVE || 0,
    completed,
    cancelled: (statusCounts.FAILED || 0) + (statusCounts.ABORTED || 0),
    completionRate,
    averageMissionDuration: avgDuration,
    missionsToday: todayCount,
    missionsThisWeek: weekCount,
    missionsThisMonth: monthCount,
  };
}

/**
 * Build maintenance analytics response
 */
export function buildDashboardMaintenance(
  statusCounts: Record<string, number>,
  costAgg: { _sum: { cost: Prisma.Decimal | null }; _avg: { cost: Prisma.Decimal | null } },
  overdueCount: number,
  upcomingCount: number,
  thisMonthCount: number
): DashboardMaintenanceResponse {
  return {
    scheduled: statusCounts.SCHEDULED || 0,
    inProgress: statusCounts.IN_PROGRESS || 0,
    completed: statusCounts.COMPLETED || 0,
    cancelled: statusCounts.CANCELLED || 0,
    overdue: overdueCount,
    upcoming: upcomingCount,
    totalCost: costAgg._sum.cost,
    averageCost: costAgg._avg.cost,
    maintenanceThisMonth: thisMonthCount,
  };
}

/**
 * Build alert analytics response
 */
export function buildDashboardAlerts(
  statusCounts: { open: number; acknowledged: number; resolved: number },
  severityCounts: Record<AlertSeverity, number>,
  typeCounts: Record<AlertType, number>,
  last24Hours: number,
  thisWeek: number
): DashboardAlertsResponse {
  return {
    open: statusCounts.open,
    acknowledged: statusCounts.acknowledged,
    resolved: statusCounts.resolved,
    critical: severityCounts.CRITICAL || 0,
    high: severityCounts.HIGH || 0,
    medium: severityCounts.MEDIUM || 0,
    low: severityCounts.LOW || 0,
    alertsByType: typeCounts,
    alertsLast24Hours: last24Hours,
    alertsThisWeek: thisWeek,
  };
}

/**
 * Build telemetry analytics response
 */
export function buildDashboardTelemetry(
  agg: {
    _avg: {
      batteryLevel: number | null;
      temperature: number | null;
      altitude: number | null;
      speed: number | null;
      signalStrength: number | null;
    };
    _min: { batteryLevel: number | null };
    _max: { batteryLevel: number | null };
  },
  dronesReporting: number,
  lastTelemetry: Date | null
): DashboardTelemetryResponse {
  return {
    averageBattery: agg._avg.batteryLevel !== null ? Math.round(agg._avg.batteryLevel * 10) / 10 : 0,
    minimumBattery: agg._min.batteryLevel ?? 0,
    maximumBattery: agg._max.batteryLevel ?? 0,
    averageTemperature: agg._avg.temperature !== null ? Math.round(agg._avg.temperature * 10) / 10 : null,
    averageAltitude: agg._avg.altitude !== null ? Math.round(agg._avg.altitude * 10) / 10 : null,
    averageSpeed: agg._avg.speed !== null ? Math.round(agg._avg.speed * 10) / 10 : null,
    averageSignalStrength: agg._avg.signalStrength !== null ? Math.round(agg._avg.signalStrength * 10) / 10 : null,
    dronesReporting,
    lastTelemetryReceived: lastTelemetry,
  };
}

/**
 * Get telemetry aggregate
 */
export async function getTelemetryAgg(
  where: Prisma.TelemetryWhereInput
): Promise<{
  _avg: { batteryLevel: number | null; temperature: number | null; altitude: number | null; speed: number | null; signalStrength: number | null };
  _min: { batteryLevel: number | null };
  _max: { batteryLevel: number | null };
}> {
  const { PrismaClient } = await import('@prisma/client');
  // Use Prisma's aggregate function directly
  // This is a helper that will be implemented in the service
  return { _avg: { batteryLevel: null, temperature: null, altitude: null, speed: null, signalStrength: null }, _min: { batteryLevel: null }, _max: { batteryLevel: null } };
}