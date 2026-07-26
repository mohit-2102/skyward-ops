import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { DroneStatus, MissionStatus, AlertSeverity, AlertType, MaintenanceStatus } from '@prisma/client';
import {
  DashboardOverviewResponse,
  DashboardFleetResponse,
  DashboardMapResponse,
  DashboardActivityResponse,
  DashboardHealthResponse,
  DashboardMissionsResponse,
  DashboardMaintenanceResponse,
  DashboardAlertsResponse,
  DashboardTelemetryResponse,
  DashboardQueryInput,
  ActivityFeedItem,
} from './dashboard.types';
import {
  toFleetDroneResponse,
  toMapDroneResponse,
  toAlertActivityItems,
  toMissionActivityItems,
  toMaintenanceActivityItems,
  sortActivityItems,
  paginateActivityItems,
  buildDashboardOverview,
  buildDashboardHealth,
  buildDashboardMissions,
  buildDashboardMaintenance,
  buildDashboardAlerts,
  buildDashboardTelemetry,
} from './dashboard.mapper';

const dashboardSelect = {
  id: true,
  serialNumber: true,
  name: true,
  model: true,
  status: true,
  batteryLevel: true,
  latitude: true,
  longitude: true,
  altitude: true,
  speed: true,
  heading: true,
  lastSeenAt: true,
  missions: {
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      status: true,
    },
    take: 1,
  },
  telemetry: {
    orderBy: { recordedAt: 'desc' },
    select: {
      recordedAt: true,
      signalStrength: true,
      temperature: true,
    },
    take: 1,
  },
} satisfies Prisma.DroneSelect;

type DroneWithRelations = Prisma.DroneGetPayload<{
  select: typeof dashboardSelect;
}>;

function toFleetCard(drone: DroneWithRelations) {
  const activeMission = drone.missions[0] || null;
  const latestTelemetry = drone.telemetry[0] || null;

  return toFleetDroneResponse({
    id: drone.id,
    serialNumber: drone.serialNumber,
    name: drone.name,
    model: drone.model,
    status: drone.status,
    batteryLevel: drone.batteryLevel,
    lastSeenAt: latestTelemetry?.recordedAt ?? drone.lastSeenAt,
    latitude: drone.latitude,
    longitude: drone.longitude,
    heading: drone.heading,
    speed: drone.speed,
    signalStrength: latestTelemetry?.signalStrength ?? null,
    temperature: latestTelemetry?.temperature ?? null,
    activeMission,
  });
}

function toMapCard(drone: DroneWithRelations) {
  const activeMission = drone.missions[0] || null;
  const latestTelemetry = drone.telemetry[0] || null;

  return toMapDroneResponse({
    id: drone.id,
    name: drone.name,
    latitude: drone.latitude,
    longitude: drone.longitude,
    batteryLevel: drone.batteryLevel,
    status: drone.status,
    heading: drone.heading,
    speed: drone.speed,
    lastSeenAt: latestTelemetry?.recordedAt ?? drone.lastSeenAt,
    activeMission,
  });
}

async function getTelemetryAgg(
  where: Prisma.TelemetryWhereInput
): Promise<{
  _avg: { batteryLevel: number | null; temperature: number | null; altitude: number | null; speed: number | null; signalStrength: number | null };
  _min: { batteryLevel: number | null };
  _max: { batteryLevel: number | null };
}> {
  // Use Prisma's actual aggregate return type - cast to avoid type mismatch
  return prisma.telemetry.aggregate({ where }) as any;
}

export const dashboardService = {
  async getOverview(query: DashboardQueryInput): Promise<DashboardOverviewResponse> {
    const { from, to, droneId } = query;

    const droneWhere: Prisma.DroneWhereInput = {};
    if (droneId) droneWhere.id = droneId;

    const telemetryWhere: Prisma.TelemetryWhereInput = {};
    if (droneId) telemetryWhere.droneId = droneId;
    if (from || to) {
      telemetryWhere.recordedAt = {};
      if (from) telemetryWhere.recordedAt.gte = from;
      if (to) telemetryWhere.recordedAt.lte = to;
    }

    const missionWhere: Prisma.MissionWhereInput = {};
    if (droneId) missionWhere.droneId = droneId;
    if (from || to) {
      missionWhere.plannedStartAt = {};
      if (from) missionWhere.plannedStartAt.gte = from;
      if (to) missionWhere.plannedStartAt.lte = to;
    }

    const alertWhere: Prisma.AlertWhereInput = {};
    if (droneId) alertWhere.droneId = droneId;
    if (from || to) {
      alertWhere.createdAt = {};
      if (from) alertWhere.createdAt.gte = from;
      if (to) alertWhere.createdAt.lte = to;
    }

    const maintenanceWhere: Prisma.MaintenanceRecordWhereInput = {};
    if (droneId) maintenanceWhere.droneId = droneId;
    if (from || to) {
      maintenanceWhere.scheduledAt = {};
      if (from) maintenanceWhere.scheduledAt.gte = from;
      if (to) maintenanceWhere.scheduledAt.lte = to;
    }

    const [
      droneStats,
      missionStats,
      alertStats,
      avgBatteryResult,
      fleetUtilizationResult,
    ] = await Promise.all([
      prisma.drone.groupBy({
        by: ['status'],
        where: droneWhere,
        _count: { id: true },
      }),
      prisma.mission.groupBy({
        by: ['status'],
        where: missionWhere,
        _count: { id: true },
      }),
      prisma.alert.groupBy({
        by: ['severity'],
        where: { ...alertWhere, resolvedAt: null },
        _count: { id: true },
      }),
      prisma.drone.aggregate({
        where: { ...droneWhere, status: { notIn: ['OFFLINE', 'MAINTENANCE'] } },
        _avg: { batteryLevel: true },
      }),
      prisma.drone.count({
        where: { ...droneWhere, status: { in: ['IN_FLIGHT', 'ONLINE', 'CHARGING'] } },
      }),
    ]);

    const totalDrones = await prisma.drone.count({ where: droneWhere });
    const totalMissions = await prisma.mission.count({ where: missionWhere });

    const droneStatusMap = droneStats.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<DroneStatus, number>);

    const missionStatusMap = missionStats.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<MissionStatus, number>);

    const alertSeverityMap = alertStats.reduce((acc, curr) => {
      acc[curr.severity] = curr._count.id;
      return acc;
    }, {} as Record<AlertSeverity, number>);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const [completedToday, upcomingMaintenance, overdueMaintenance] = await Promise.all([
      prisma.mission.count({
        where: {
          ...missionWhere,
          status: 'COMPLETED',
          completedAt: { gte: startOfToday, lt: endOfToday },
        },
      }),
      prisma.maintenanceRecord.count({
        where: {
          ...maintenanceWhere,
          status: 'SCHEDULED',
          scheduledAt: { gte: now, lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.maintenanceRecord.count({
        where: {
          ...maintenanceWhere,
          status: 'SCHEDULED',
          scheduledAt: { lt: now },
        },
      }),
    ]);

    const fleetUtilization = totalDrones > 0
      ? Math.round((fleetUtilizationResult / totalDrones) * 100)
      : 0;

    return buildDashboardOverview(
      {
        total: totalDrones,
        online: droneStatusMap.ONLINE || 0,
        offline: droneStatusMap.OFFLINE || 0,
        inFlight: droneStatusMap.IN_FLIGHT || 0,
        maintenance: droneStatusMap.MAINTENANCE || 0,
        charging: droneStatusMap.CHARGING || 0,
        avgBattery: avgBatteryResult._avg.batteryLevel ?? 0,
      },
      {
        total: totalMissions,
        active: missionStatusMap.ACTIVE || 0,
        completedToday,
      },
      {
        active: Object.values(alertSeverityMap).reduce((a, b) => a + b, 0),
        critical: alertSeverityMap.CRITICAL || 0,
      },
      {
        upcoming: upcomingMaintenance,
        overdue: overdueMaintenance,
      },
      fleetUtilization
    );
  },

  async getFleet(query: DashboardQueryInput): Promise<DashboardFleetResponse> {
    const { page = 1, pageSize = 20, droneId, status } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: Prisma.DroneWhereInput = {};
    if (droneId) where.id = droneId;
    if (status) where.status = status as DroneStatus;

    const [drones, total] = await Promise.all([
      prisma.drone.findMany({
        where,
        select: dashboardSelect,
        orderBy: { lastSeenAt: 'desc' },
        skip,
        take,
      }),
      prisma.drone.count({ where }),
    ]);

    return {
      data: drones.map(toFleetCard),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getMap(query: DashboardQueryInput): Promise<DashboardMapResponse[]> {
    const { droneId, status } = query;

    const where: Prisma.DroneWhereInput = {};
    if (droneId) where.id = droneId;
    if (status) where.status = status as DroneStatus;

    const drones = await prisma.drone.findMany({
      where,
      select: dashboardSelect,
    });

    return drones.map(toMapCard);
  },

  async getActivity(query: DashboardQueryInput): Promise<DashboardActivityResponse> {
    const { page = 1, pageSize = 20, from, to, droneId } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const baseWhere: Prisma.AlertWhereInput = {};
    if (droneId) baseWhere.droneId = droneId;
    if (from || to) {
      baseWhere.createdAt = {};
      if (from) baseWhere.createdAt.gte = from;
      if (to) baseWhere.createdAt.lte = to;
    }

    const missionWhere: Prisma.MissionWhereInput = {};
    if (droneId) missionWhere.droneId = droneId;
    if (from || to) {
      missionWhere.createdAt = {};
      if (from) missionWhere.createdAt.gte = from;
      if (to) missionWhere.createdAt.lte = to;
    }

    const maintenanceWhere: Prisma.MaintenanceRecordWhereInput = {};
    if (droneId) maintenanceWhere.droneId = droneId;
    if (from || to) {
      maintenanceWhere.createdAt = {};
      if (from) maintenanceWhere.createdAt.gte = from;
      if (to) maintenanceWhere.createdAt.lte = to;
    }

    const telemetryWhere: Prisma.TelemetryWhereInput = {};
    if (droneId) telemetryWhere.droneId = droneId;
    if (from || to) {
      telemetryWhere.recordedAt = {};
      if (from) telemetryWhere.recordedAt.gte = from;
      if (to) telemetryWhere.recordedAt.lte = to;
    }

    const [alerts, missions, maintenanceRecords, telemetryUpdates] = await Promise.all([
      prisma.alert.findMany({
        where: baseWhere,
        select: {
          id: true,
          type: true,
          severity: true,
          message: true,
          createdAt: true,
          drone: { select: { id: true, name: true, serialNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.mission.findMany({
        where: missionWhere,
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          actualStartAt: true,
          completedAt: true,
          drone: { select: { id: true, name: true, serialNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.maintenanceRecord.findMany({
        where: maintenanceWhere,
        select: {
          id: true,
          type: true,
          status: true,
          description: true,
          createdAt: true,
          scheduledAt: true,
          startedAt: true,
          completedAt: true,
          drone: { select: { id: true, name: true, serialNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.telemetry.findMany({
        where: telemetryWhere,
        select: {
          id: true,
          recordedAt: true,
          batteryLevel: true,
          latitude: true,
          longitude: true,
          altitude: true,
          speed: true,
          drone: { select: { id: true, name: true, serialNumber: true } },
        },
        orderBy: { recordedAt: 'desc' },
        skip,
        take,
      }),
    ]);

    const totalAlerts = await prisma.alert.count({ where: baseWhere });
    const totalMissions = await prisma.mission.count({ where: missionWhere });
    const totalMaintenance = await prisma.maintenanceRecord.count({ where: maintenanceWhere });
    const totalTelemetry = await prisma.telemetry.count({ where: telemetryWhere });

    const total = totalAlerts + totalMissions + totalMaintenance + totalTelemetry;

    const activityItems: ActivityFeedItem[] = [
      ...toAlertActivityItems(alerts.map(a => ({ ...a, droneId: a.drone.id }))),
      ...toMissionActivityItems(missions.map(m => ({ ...m, droneId: m.drone.id }))),
      ...toMaintenanceActivityItems(maintenanceRecords.map(r => ({ ...r, droneId: r.drone.id }))),
      ...telemetryUpdates.map(t => ({
        id: t.id,
        type: 'telemetry' as const,
        timestamp: t.recordedAt,
        droneId: t.drone.id,
        droneName: t.drone.name,
        droneSerialNumber: t.drone.serialNumber,
        title: 'Telemetry Update',
        description: `Battery: ${t.batteryLevel}%, Alt: ${t.altitude}m, Speed: ${t.speed} km/h`,
      })),
    ];

    const sortedItems = sortActivityItems(activityItems);
    const paginated = paginateActivityItems(sortedItems, page, pageSize);

    return {
      data: paginated.data,
      pagination: paginated.pagination,
    };
  },

  async getHealth(query: DashboardQueryInput): Promise<DashboardHealthResponse> {
    const { droneId } = query;

    const where: Prisma.DroneWhereInput = {};
    if (droneId) where.id = droneId;

    const drones = await prisma.drone.findMany({
      where,
      select: {
        id: true,
        status: true,
        batteryLevel: true,
        signalStrength: true,
        temperature: true,
      },
    });

    if (drones.length === 0) {
      return {
        averageBattery: 0,
        averageSignal: 0,
        averageTemperature: null,
        healthyDrones: 0,
        warningDrones: 0,
        criticalDrones: 0,
        offlineDrones: 0,
        maintenanceDrones: 0,
      };
    }

    return buildDashboardHealth(drones);
  },

  async getMissions(query: DashboardQueryInput): Promise<DashboardMissionsResponse> {
    const { droneId, from, to } = query;

    const where: Prisma.MissionWhereInput = {};
    if (droneId) where.droneId = droneId;
    if (from || to) {
      where.plannedStartAt = {};
      if (from) where.plannedStartAt.gte = from;
      if (to) where.plannedStartAt.lte = to;
    }

    const [
      statusCounts,
      totalMissions,
      todayCount,
      weekCount,
      monthCount,
    ] = await Promise.all([
      prisma.mission.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      prisma.mission.count({ where }),
      prisma.mission.count({
        where: {
          ...where,
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.mission.count({
        where: {
          ...where,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.mission.count({
        where: {
          ...where,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const statusMap = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<MissionStatus, number>);

    const completedWithDuration = await prisma.mission.findMany({
      where: { ...where, status: 'COMPLETED', actualStartAt: { not: null }, completedAt: { not: null } },
      select: { actualStartAt: true, completedAt: true },
    });

    let averageMissionDuration: number | null = null;
    if (completedWithDuration.length > 0) {
      const totalMs = completedWithDuration.reduce((sum, m) => {
        const start = m.actualStartAt!.getTime();
        const end = m.completedAt!.getTime();
        return sum + (end - start);
      }, 0);
      averageMissionDuration = Math.round(totalMs / completedWithDuration.length / 60000);
    }

    return buildDashboardMissions(
      statusMap,
      totalMissions,
      averageMissionDuration,
      todayCount,
      weekCount,
      monthCount
    );
  },

  async getMaintenance(query: DashboardQueryInput): Promise<DashboardMaintenanceResponse> {
    const { droneId, from, to } = query;

    const where: Prisma.MaintenanceRecordWhereInput = {};
    if (droneId) where.droneId = droneId;
    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt.gte = from;
      if (to) where.scheduledAt.lte = to;
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      statusCounts,
      costAgg,
      overdueCount,
      upcomingCount,
      thisMonthCount,
    ] = await Promise.all([
      prisma.maintenanceRecord.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      prisma.maintenanceRecord.aggregate({
        where,
        _sum: { cost: true },
        _avg: { cost: true },
      }),
      prisma.maintenanceRecord.count({
        where: { ...where, status: 'SCHEDULED', scheduledAt: { lt: now } },
      }),
      prisma.maintenanceRecord.count({
        where: { ...where, status: 'SCHEDULED', scheduledAt: { gte: now, lte: thirtyDaysFromNow } },
      }),
      prisma.maintenanceRecord.count({
        where: { ...where, createdAt: { gte: startOfMonth } },
      }),
    ]);

    const statusMap = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<MaintenanceStatus, number>);

    return buildDashboardMaintenance(statusMap, costAgg, overdueCount, upcomingCount, thisMonthCount);
  },

  async getAlerts(query: DashboardQueryInput): Promise<DashboardAlertsResponse> {
    const { droneId, from, to } = query;

    const where: Prisma.AlertWhereInput = {};
    if (droneId) where.droneId = droneId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      severityCounts,
      typeCounts,
      openCount,
      ackCount,
      resolvedCount,
      last24HoursCount,
      thisWeekCount,
    ] = await Promise.all([
      prisma.alert.groupBy({
        by: ['severity'],
        where,
        _count: { id: true },
      }),
      prisma.alert.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
      }),
      prisma.alert.count({ where: { ...where, acknowledgedAt: null, resolvedAt: null } }),
      prisma.alert.count({ where: { ...where, acknowledgedAt: { not: null }, resolvedAt: null } }),
      prisma.alert.count({ where: { ...where, resolvedAt: { not: null } } }),
      prisma.alert.count({ where: { ...where, createdAt: { gte: last24Hours } } }),
      prisma.alert.count({ where: { ...where, createdAt: { gte: lastWeek } } }),
    ]);

    const severityMap = severityCounts.reduce((acc, curr) => {
      acc[curr.severity] = curr._count.id;
      return acc;
    }, {} as Record<AlertSeverity, number>);

    const typeMap = typeCounts.reduce((acc, curr) => {
      acc[curr.type] = curr._count.id;
      return acc;
    }, {} as Record<AlertType, number>);

    return buildDashboardAlerts(
      { open: openCount, acknowledged: ackCount, resolved: resolvedCount },
      severityMap,
      typeMap,
      last24HoursCount,
      thisWeekCount
    );
  },

  async getTelemetry(query: DashboardQueryInput): Promise<DashboardTelemetryResponse> {
    const { droneId, from, to } = query;

    const where: Prisma.TelemetryWhereInput = {};
    if (droneId) where.droneId = droneId;
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = from;
      if (to) where.recordedAt.lte = to;
    }

    const [agg, dronesReporting, lastTelemetry] = await Promise.all([
      getTelemetryAgg(where),
      prisma.drone.count({
        where: {
          ...(droneId ? { id: droneId } : {}),
          lastSeenAt: from ? { gte: from } : undefined,
        },
      }),
      prisma.telemetry.findFirst({
        where,
        select: { recordedAt: true },
        orderBy: { recordedAt: 'desc' },
      }),
    ]);

    return buildDashboardTelemetry(agg, dronesReporting, lastTelemetry?.recordedAt ?? null);
  },
};