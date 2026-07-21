// ============================================
// RANDOM HELPERS
// Reusable random utilities for seed data generation
// ============================================

import { faker } from '@faker-js/faker';

// Seed faker for reproducible results
faker.seed(12345);

/**
 * Get a random element from an array
 */
export function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random float between min and max
 */
export function randomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Generate a random serial number
 */
export function generateSerialNumber(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let serial = prefix;
  for (let i = 0; i < 8; i++) {
    serial += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return serial;
}

/**
 * Generate a random coordinate within a radius (km) of a center point
 */
export function randomCoordinate(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): { latitude: number; longitude: number } {
  // Convert radius to degrees (approximate)
  const radiusLat = radiusKm / 111.32; // 1 degree lat ≈ 111.32 km

  const u = Math.random();
  const v = Math.random();
  const w = radiusLat * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const lat = centerLat + x;
  const lng = centerLng + y;

  return {
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
  };
}

/**
 * Generate a random timestamp within the last N hours
 */
export function randomRecentTimestamp(hoursAgo: number): Date {
  const now = new Date();
  const msAgo = Math.random() * hoursAgo * 60 * 60 * 1000;
  return new Date(now.getTime() - msAgo);
}

/**
 * Generate a random timestamp within the last N days
 */
export function randomRecentDays(daysAgo: number): Date {
  const now = new Date();
  const msAgo = Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - msAgo);
}

/**
 * Generate a future timestamp within N days
 */
export function randomFutureTimestamp(daysAhead: number): Date {
  const now = new Date();
  const msAhead = Math.random() * daysAhead * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() + msAhead);
}

/**
 * Generate realistic battery level (weighted toward higher values)
 */
export function randomBatteryLevel(): number {
  // 70% chance of 30-100%, 20% chance of 15-30%, 10% chance of 5-15%
  const rand = Math.random();
  if (rand < 0.7) return randomInt(30, 100);
  if (rand < 0.9) return randomInt(15, 30);
  return randomInt(5, 15);
}

/**
 * Generate realistic battery health (slowly degrades)
 */
export function randomBatteryHealth(): number {
  // Most drones have good health (80-100), some older ones lower
  const rand = Math.random();
  if (rand < 0.6) return randomInt(85, 100);
  if (rand < 0.9) return randomInt(65, 85);
  return randomInt(40, 65);
}

/**
 * Generate realistic signal strength (0-100)
 */
export function randomSignalStrength(): number {
  // Mostly good signal
  const rand = Math.random();
  if (rand < 0.7) return randomInt(70, 100);
  if (rand < 0.9) return randomInt(40, 70);
  return randomInt(10, 40);
}

/**
 * Generate realistic GPS accuracy (meters)
 */
export function randomGpsAccuracy(): number {
  // RTK drones: 0.01-0.1m, Standard: 1-5m
  const rand = Math.random();
  if (rand < 0.3) return randomFloat(0.01, 0.1, 2);
  if (rand < 0.7) return randomFloat(0.5, 2.5, 1);
  return randomFloat(2, 10, 1);
}

/**
 * Generate weather data
 */
export function randomWeather(): { temperature: number; humidity: number; windSpeed: number } {
  return {
    temperature: randomFloat(-5, 35, 1),
    humidity: randomInt(20, 90),
    windSpeed: randomFloat(0, 25, 1),
  };
}

/**
 * Generate a realistic firmware version for a manufacturer
 */
export function randomFirmwareVersion(manufacturer: string, versions: Record<string, readonly string[]>): string {
  const manufacturerVersions = versions[manufacturer] || versions.DJI;
  return randomElement(manufacturerVersions);
}

/**
 * Generate a random cost with some variance
 */
export function randomCost(baseCost: number, variancePercent = 0.2): number {
  const variance = baseCost * variancePercent;
  return randomFloat(baseCost - variance, baseCost + variance, 2);
}

/**
 * Pick random status with weighted distribution
 */
export function randomDroneStatus(): 'ONLINE' | 'OFFLINE' | 'IN_FLIGHT' | 'CHARGING' | 'MAINTENANCE' {
  const rand = Math.random();
  if (rand < 0.35) return 'ONLINE';
  if (rand < 0.55) return 'OFFLINE';
  if (rand < 0.7) return 'IN_FLIGHT';
  if (rand < 0.85) return 'CHARGING';
  return 'MAINTENANCE';
}

/**
 * Pick random mission status with weighted distribution
 */
export function randomMissionStatus(): 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ABORTED' {
  const rand = Math.random();
  if (rand < 0.3) return 'PLANNED';
  if (rand < 0.5) return 'COMPLETED';
  if (rand < 0.65) return 'ACTIVE';
  if (rand < 0.85) return 'FAILED';
  return 'ABORTED';
}

/**
 * Pick random maintenance status
 */
export function randomMaintenanceStatus(): 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' {
  const rand = Math.random();
  if (rand < 0.4) return 'SCHEDULED';
  if (rand < 0.7) return 'COMPLETED';
  if (rand < 0.9) return 'IN_PROGRESS';
  return 'CANCELLED';
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate unique IDs for a set
 */
export function generateUniqueIds(count: number, prefix: string): string[] {
  const ids = new Set<string>();
  while (ids.size < count) {
    ids.add(`${prefix}-${faker.string.alphanumeric(8).toUpperCase()}`);
  }
  return Array.from(ids);
}