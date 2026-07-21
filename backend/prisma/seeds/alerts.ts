// ============================================
// ALERTS SEED
// ============================================

import { prisma } from '../../src/lib/prisma';
import { generateAlerts, SEED_COUNTS } from '../helpers/generators';

export async function seedAlerts(drones: { id: string }[]) {
  console.log('🌱 Seeding alerts...');

  // Clear existing alerts
  await prisma.alert.deleteMany();

  const droneIds = drones.map(d => d.id);
  const alertsData = generateAlerts(droneIds);

  await prisma.alert.createMany({
    data: alertsData,
    skipDuplicates: true,
  });

  const created = await prisma.alert.findMany();
  console.log(`✅ Created ${created.length} alerts`);
  return created;
}