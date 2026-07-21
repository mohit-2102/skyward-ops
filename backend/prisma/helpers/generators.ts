// ============================================
// GENERATORS
// Data generators that compose random helpers and constants
// ============================================

import {
  randomCoordinate,
  randomBatteryLevel,
  randomBatteryHealth,
  randomSignalStrength,
  randomGpsAccuracy,
  randomWeather,
  randomDroneStatus,
  randomMissionStatus,
  randomMaintenanceStatus,
  shuffleArray,
  randomFirmwareVersion,
  randomCost,
  randomInt,
  randomFloat,
  randomElement,
  randomRecentDays,
  generateSerialNumber,
} from './random';
import {
  OPERATIONAL_AREA,
  DRONE_MODELS,
  DRONE_NAMES,
  MISSION_TEMPLATES,
  MAINTENANCE_TEMPLATES,
  ALERT_TEMPLATES,
  FIRMWARE_VERSIONS,
  TIME_RANGES,
  SEED_COUNTS,
  MOVEMENT_PARAMS,
  WEATHER,
  BATTERY_DRAIN,
  TECHNICIANS,
  OPERATORS,
} from './constants';
import type { DroneModelSpec } from './constants';

// Re-export constants that seed modules need
export { SEED_COUNTS } from './constants';

/**
 * Generate a single drone with realistic specs
 */
export function generateDrone(manufacturers: { id: string; name: string }[], index: number) {
  const manufacturer = manufacturers[index % manufacturers.length];
  const models = DRONE_MODELS[manufacturer.name] || DRONE_MODELS.DJI;
  const modelSpec = randomElement(models);
  const name = DRONE_NAMES[index % DRONE_NAMES.length];

  const coords = randomCoordinate(
    OPERATIONAL_AREA.center.latitude,
    OPERATIONAL_AREA.center.longitude,
    OPERATIONAL_AREA.radiusKm
  );

  return {
    serialNumber: generateSerialNumber(manufacturer.name.substring(0, 3).toUpperCase()),
    name,
    model: modelSpec.model,
    manufacturerId: manufacturer.id,
    status: randomDroneStatus(),
    firmwareVersion: randomFirmwareVersion(manufacturer.name, FIRMWARE_VERSIONS),
    batteryLevel: randomBatteryLevel(),
    batteryHealth: randomBatteryHealth(),
    latitude: coords.latitude,
    longitude: coords.longitude,
    altitude: randomFloat(OPERATIONAL_AREA.altitudeRange.min, OPERATIONAL_AREA.altitudeRange.max, 1),
    speed: randomFloat(0, modelSpec.maxSpeed * 0.8, 1),
    heading: randomFloat(0, 360, 1),
    payloadCapacity: modelSpec.payloadCapacity,
    camera: modelSpec.camera,
    weight: modelSpec.weight,
    maxFlightTime: modelSpec.maxFlightTime,
    maxSpeed: modelSpec.maxSpeed,
  };
}

/**
 * Generate telemetry for a drone with realistic movement simulation
 * Uses shared weather snapshot for all drones in the same time window
 * Battery drain depends on drone status
 */
export function generateTelemetry(
  droneId: string,
  maxSpeed: number,
  count: number,
  status?: string
) {
  const telemetry = [];
  const baseTime = new Date();

  // Start from a base position near the operational area center
  let currentLat = OPERATIONAL_AREA.center.latitude + (Math.random() - 0.5) * 0.1;
  let currentLng = OPERATIONAL_AREA.center.longitude + (Math.random() - 0.5) * 0.1;
  let currentAlt = randomFloat(50, 300, 1);
  let currentHeading = randomFloat(0, 360, 1);
  let currentSpeed = randomFloat(0, 15, 1);
  let battery = randomBatteryLevel();

  // Determine battery drain rate based on status
  const getBatteryDrain = (droneStatus: string | undefined) => {
    switch (droneStatus) {
      case 'IN_FLIGHT':
        return BATTERY_DRAIN.IN_FLIGHT;
      case 'ONLINE':
        return BATTERY_DRAIN.ONLINE;
      case 'OFFLINE':
        return BATTERY_DRAIN.OFFLINE;
      case 'CHARGING':
        return BATTERY_DRAIN.CHARGING;
      case 'MAINTENANCE':
        return BATTERY_DRAIN.MAINTENANCE;
      default:
        return BATTERY_DRAIN.IN_FLIGHT;
    }
  };

  const drainRate = getBatteryDrain(status);

  // Use shared weather for this batch (we'll generate one per call for simplicity)
  let currentWeather = randomWeather();
  let weatherCounter = 0;

  for (let i = 0; i < count; i++) {
    // Refresh weather periodically
    if (weatherCounter >= WEATHER.snapshotInterval) {
      currentWeather = randomWeather();
      weatherCounter = 0;
    }
    weatherCounter++;

    // Simulate movement
    const turnAngle = randomFloat(-MOVEMENT_PARAMS.maxTurnDegrees, MOVEMENT_PARAMS.maxTurnDegrees, 1);
    currentHeading = (currentHeading + turnAngle + 360) % 360;

    const speedChange = randomFloat(-MOVEMENT_PARAMS.maxSpeedChange, MOVEMENT_PARAMS.maxSpeedChange, 1);
    currentSpeed = Math.max(0, Math.min(maxSpeed * 0.9, currentSpeed + speedChange));

    // Move in heading direction
    const distanceKm = (currentSpeed / 3600) * MOVEMENT_PARAMS.telemetryIntervalSeconds;
    const headingRad = (currentHeading * Math.PI) / 180;
    currentLat += (distanceKm / 111.32) * Math.cos(headingRad);
    currentLng += (distanceKm / (111.32 * Math.cos((currentLat * Math.PI) / 180))) * Math.sin(headingRad);

    // Keep within operational area
    const latDiff = currentLat - OPERATIONAL_AREA.center.latitude;
    const lngDiff = currentLng - OPERATIONAL_AREA.center.longitude;
    const distanceFromCenter = Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111.32;

    if (distanceFromCenter > OPERATIONAL_AREA.radiusKm) {
      const angleToCenter = Math.atan2(-latDiff, -lngDiff);
      currentLat += (distanceKm / 111.32) * Math.cos(angleToCenter) * MOVEMENT_PARAMS.boundaryPullbackFactor;
      currentLng += (distanceKm / 111.32) * Math.sin(angleToCenter) * MOVEMENT_PARAMS.boundaryPullbackFactor;
    }

    // Altitude changes
    const altChange = randomFloat(-MOVEMENT_PARAMS.maxAltitudeChange, MOVEMENT_PARAMS.maxAltitudeChange, 1);
    currentAlt = Math.max(10, Math.min(OPERATIONAL_AREA.altitudeRange.max, currentAlt + altChange));

    // Battery drain based on drone status
    battery = Math.max(0, battery - drainRate);

    // Timestamp going backwards from now (most recent first)
    const timestamp = new Date(baseTime.getTime() - (count - i) * MOVEMENT_PARAMS.telemetryIntervalSeconds * 1000);

    telemetry.push({
      droneId,
      batteryLevel: Math.round(battery),
      latitude: Number(currentLat.toFixed(6)),
      longitude: Number(currentLng.toFixed(6)),
      altitude: Number(currentAlt.toFixed(1)),
      speed: Number(currentSpeed.toFixed(1)),
      heading: Number(currentHeading.toFixed(1)),
      temperature: currentWeather.temperature,
      humidity: currentWeather.humidity,
      windSpeed: currentWeather.windSpeed,
      signalStrength: randomSignalStrength(),
      gpsAccuracy: randomGpsAccuracy(),
      recordedAt: timestamp,
    });
  }

  return telemetry;
}

/**
 * Generate missions
 */
export function generateMissions(droneIds: string[]) {
  const missions = [];
  const templates = shuffleArray([...MISSION_TEMPLATES]);

  for (let i = 0; i < Math.min(SEED_COUNTS.missions, templates.length); i++) {
    const template = templates[i];
    const droneId = randomElement(droneIds);
    const status = randomMissionStatus();

    const plannedStart = randomRecentDays(TIME_RANGES.missionDays);
    let actualStart: Date | null = null;
    let completedAt: Date | null = null;

    if (status !== 'PLANNED') {
      actualStart = new Date(plannedStart.getTime() + randomInt(-30, 30) * 60 * 1000);
    }
    if (status === 'COMPLETED' || status === 'FAILED' || status === 'ABORTED') {
      completedAt = new Date((actualStart || plannedStart).getTime() + randomInt(30, 240) * 60 * 1000);
    }

    const waypoints = generateWaypoints(5 + randomInt(0, 8));
    const plannedRoute = generateRoute(waypoints);
    const actualRoute = status !== 'PLANNED' ? generateRoute(waypoints, true) : undefined;

    missions.push({
      name: template.name,
      description: template.description,
      droneId,
      status,
      plannedStartAt: plannedStart,
      actualStartAt: actualStart,
      completedAt,
      plannedRoute,
      actualRoute,
      waypoints,
    });
  }

  return missions;
}

/**
 * Generate maintenance records
 */
export function generateMaintenance(droneIds: string[]) {
  const maintenance = [];

  for (const droneId of droneIds) {
    const count = randomInt(2, SEED_COUNTS.maintenancePerDrone);
    const templates = shuffleArray([...MAINTENANCE_TEMPLATES]);

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      const status = randomMaintenanceStatus();

      const scheduledAt = randomRecentDays(TIME_RANGES.maintenanceDays);
      let startedAt: Date | null = null;
      let completedAt: Date | null = null;
      let nextDueAt: Date | null = null;

      if (status !== 'SCHEDULED') {
        startedAt = new Date(scheduledAt.getTime() + randomInt(-60, 120) * 60 * 1000);
      }
      if (status === 'COMPLETED') {
        completedAt = new Date((startedAt || scheduledAt).getTime() + randomInt(30, 480) * 60 * 1000);
        if (template.intervalHours > 0) {
          nextDueAt = new Date(completedAt.getTime() + template.intervalHours * 60 * 60 * 1000);
        }
      }
      if (status === 'SCHEDULED' && template.intervalHours > 0) {
        nextDueAt = new Date(scheduledAt.getTime() + template.intervalHours * 60 * 60 * 1000);
      }

      maintenance.push({
        droneId,
        type: template.type,
        status,
        description: template.description,
        performedBy: status === 'COMPLETED' ? `Tech ${randomElement(TECHNICIANS)}` : null,
        cost: template.baseCost > 0 ? randomCost(template.baseCost) : 0,
        scheduledAt,
        startedAt,
        completedAt,
        nextDueAt,
        notes: status === 'COMPLETED' ? 'All checks passed' : status === 'CANCELLED' ? 'Rescheduled due to weather' : null,
      });
    }
  }

  return maintenance;
}

/**
 * Generate alerts
 */
export function generateAlerts(droneIds: string[]) {
  const alerts = [];
  const templates = shuffleArray([...ALERT_TEMPLATES]);

  for (let i = 0; i < SEED_COUNTS.alerts; i++) {
    const template = templates[i % templates.length];
    const droneId = randomElement(droneIds);
    const createdAt = randomRecentDays(TIME_RANGES.alertDays);

    let acknowledgedAt: Date | null = null;
    let acknowledgedBy: string | null = null;
    let resolvedAt: Date | null = null;
    let resolvedBy: string | null = null;

    // Higher severity = more likely to be acknowledged
    const ackProbability = template.severity === 'LOW' ? 0.3 : template.severity === 'MEDIUM' ? 0.6 : 0.9;

    if (Math.random() < ackProbability) {
      acknowledgedAt = new Date(createdAt.getTime() + randomInt(1, 120) * 60 * 1000);
      acknowledgedBy = `Operator ${randomElement(OPERATORS)}`;

      // Most acknowledged alerts get resolved
      if (Math.random() < 0.8) {
        resolvedAt = new Date(acknowledgedAt.getTime() + randomInt(5, 240) * 60 * 1000);
        resolvedBy = acknowledgedBy;
      }
    }

    // Build metadata based on alert type
    const metadata: Record<string, unknown> = {};
    if (template.type === 'LOW_BATTERY') {
      metadata.batteryLevel = randomInt(5, 25);
    }
    if (template.type === 'GPS_SIGNAL') {
      metadata.latitude = OPERATIONAL_AREA.center.latitude + (Math.random() - 0.5) * 0.1;
      metadata.longitude = OPERATIONAL_AREA.center.longitude + (Math.random() - 0.5) * 0.1;
      metadata.satellites = randomInt(4, 12);
    }
    if (template.type === 'COMMUNICATION') {
      metadata.signalStrength = randomInt(0, 30);
      metadata.lastPacketAge = randomInt(10, 60);
    }
    if (template.type === 'OBSTACLE') {
      metadata.distance = randomInt(5, 50);
      metadata.direction = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][randomInt(0, 7)];
    }

    alerts.push({
      droneId,
      type: template.type,
      severity: template.severity,
      message: template.message,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      acknowledgedAt,
      acknowledgedBy,
      resolvedAt,
      resolvedBy,
      createdAt,
    });
  }

  return alerts;
}

/**
 * Helper: Generate waypoints
 */
function generateWaypoints(count: number) {
  const waypoints = [];
  let lat = OPERATIONAL_AREA.center.latitude + (Math.random() - 0.5) * 0.1;
  let lng = OPERATIONAL_AREA.center.longitude + (Math.random() - 0.5) * 0.1;

  for (let i = 0; i < count; i++) {
    lat += (Math.random() - 0.5) * 0.01;
    lng += (Math.random() - 0.5) * 0.01;
    waypoints.push({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      altitude: randomFloat(50, 200, 1),
      order: i,
    });
  }

  return waypoints;
}

/**
 * Helper: Generate GeoJSON LineString route
 */
function generateRoute(waypoints: { longitude: number; latitude: number }[], addNoise = false) {
  return {
    type: 'LineString',
    coordinates: waypoints.map(w => [
      addNoise ? w.longitude + (Math.random() - 0.5) * 0.001 : w.longitude,
      addNoise ? w.latitude + (Math.random() - 0.5) * 0.001 : w.latitude,
    ]),
  };
}