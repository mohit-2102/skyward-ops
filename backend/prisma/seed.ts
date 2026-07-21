// ============================================
// PRISMA SEED ORCHESTRATOR
// Main entry point for database seeding
// ============================================

import { prisma } from '../src/lib/prisma';
import { seedManufacturers } from './seeds/manufacturers';
import { seedDrones } from './seeds/drones';
import { seedTelemetry } from './seeds/telemetry';
import { seedMissions } from './seeds/missions';
import { seedMaintenance } from './seeds/maintenance';
import { seedAlerts } from './seeds/alerts';

async function main() {
  console.log('🌱 Starting database seed...');
  const startTime = Date.now();

  try {
    // 1. Manufacturers (no dependencies)
    const manufacturers = await seedManufacturers();

    // 2. Drones (depends on manufacturers)
    const drones = await seedDrones(manufacturers);

    // 3. Run independent seed operations in parallel
    // All of these depend only on drones
    await Promise.all([
      seedTelemetry(drones),
      seedMissions(drones),
      seedMaintenance(drones),
      seedAlerts(drones),
    ]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Seed completed successfully in ${duration}s`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });