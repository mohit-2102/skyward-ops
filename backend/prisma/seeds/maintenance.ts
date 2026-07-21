// ============================================
// MAINTENANCE SEED
// ============================================

import { prisma } from '../../src/lib/prisma';
import { generateMaintenance, SEED_COUNTS } from '../helpers/generators';

export async function seedMaintenance(drones: { id: string }[]) {
  console.log('🌱 Seeding maintenance records...');

  // Clear existing maintenance
  await prisma.maintenanceRecord.deleteMany();

  const droneIds = drones.map(d => d.id);
  const maintenanceData = generateMaintenance(droneIds);

  await prisma.maintenanceRecord.createMany({
    data: maintenanceData,
    skipDuplicates: true,
  });

  const created = await prisma.maintenanceRecord.findMany();
  console.log(`✅ Created ${created.length} maintenance records`);
  return created;
}