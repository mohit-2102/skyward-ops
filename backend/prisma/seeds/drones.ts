// ============================================
// DRONES SEED
// ============================================

import { prisma } from '../../src/lib/prisma';
import { generateDrone, SEED_COUNTS } from '../helpers/generators';

export async function seedDrones(manufacturers: { id: string; name: string }[]) {
  console.log('🌱 Seeding drones...');

  // Clear existing drones
  await prisma.drone.deleteMany();

  // Generate all drone data first
  const dronesData = [];
  for (let i = 0; i < SEED_COUNTS.drones; i++) {
    dronesData.push(generateDrone(manufacturers, i));
  }

  // Insert all at once
  await prisma.drone.createMany({
    data: dronesData,
    skipDuplicates: true,
  });

  // Retrieve inserted drones
  const drones = await prisma.drone.findMany();
  console.log(`✅ Created ${drones.length} drones`);
  return drones;
}