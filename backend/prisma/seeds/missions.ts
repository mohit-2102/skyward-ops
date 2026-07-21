// ============================================
// MISSIONS SEED
// ============================================

import { prisma } from '../../src/lib/prisma';
import { generateMissions, SEED_COUNTS } from '../helpers/generators';

export async function seedMissions(drones: { id: string }[]) {
  console.log('🌱 Seeding missions...');

  // Clear existing missions
  await prisma.mission.deleteMany();

  const droneIds = drones.map(d => d.id);
  const missionsData = generateMissions(droneIds);

  await prisma.mission.createMany({
    data: missionsData,
    skipDuplicates: true,
  });

  const created = await prisma.mission.findMany();
  console.log(`✅ Created ${created.length} missions`);
  return created;
}