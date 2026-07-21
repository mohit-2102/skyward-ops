// ============================================
// TELEMETRY SEED
// ============================================

import { prisma } from '../../src/lib/prisma';
import { generateTelemetry, SEED_COUNTS } from '../helpers/generators';

export async function seedTelemetry(drones: { id: string; maxSpeed: number | null; status: string }[]) {
  console.log('🌱 Seeding telemetry...');

  // Clear existing telemetry
  await prisma.telemetry.deleteMany();

  const allTelemetry = [];

  for (const drone of drones) {
    const maxSpeed = drone.maxSpeed ?? 25; // fallback if null
    const telemetryData = generateTelemetry(drone.id, maxSpeed, SEED_COUNTS.telemetryPerDrone, drone.status);
    allTelemetry.push(...telemetryData);
  }

  // Insert in batches for performance
  const batchSize = 100;
  for (let i = 0; i < allTelemetry.length; i += batchSize) {
    const batch = allTelemetry.slice(i, i + batchSize);
    await prisma.telemetry.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  const count = await prisma.telemetry.count();
  console.log(`✅ Created ${count} telemetry records`);
  return count;
}