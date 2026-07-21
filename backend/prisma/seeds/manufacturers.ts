// ============================================
// MANUFACTURERS SEED
// ============================================

import { prisma } from '../../src/lib/prisma';
import { MANUFACTURERS } from '../helpers/constants';

export async function seedManufacturers() {
  console.log('🌱 Seeding manufacturers...');

  // Clear existing manufacturers
  await prisma.manufacturer.deleteMany();

  const manufacturersData = MANUFACTURERS.map(m => ({
    name: m.name,
    country: m.country,
    website: m.website,
  }));

  await prisma.manufacturer.createMany({
    data: manufacturersData,
    skipDuplicates: true,
  });

  const manufacturers = await prisma.manufacturer.findMany();
  console.log(`✅ Created ${manufacturers.length} manufacturers`);
  return manufacturers;
}