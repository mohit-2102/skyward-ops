import { Telemetry, Drone } from '@prisma/client';
import { TelemetryResponse } from './telemetry.types';

export function toTelemetryResponse(telemetry: Telemetry): TelemetryResponse {
  return {
    id: telemetry.id,
    droneId: telemetry.droneId,
    batteryLevel: telemetry.batteryLevel,
    latitude: telemetry.latitude,
    longitude: telemetry.longitude,
    altitude: telemetry.altitude,
    speed: telemetry.speed,
    heading: telemetry.heading,
    temperature: telemetry.temperature,
    humidity: telemetry.humidity,
    windSpeed: telemetry.windSpeed,
    signalStrength: telemetry.signalStrength,
    gpsAccuracy: telemetry.gpsAccuracy,
    recordedAt: telemetry.recordedAt,
  };
}

export function toTelemetryResponses(telemetry: Telemetry[]): TelemetryResponse[] {
  return telemetry.map(toTelemetryResponse);
}