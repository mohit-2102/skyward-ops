import { prisma } from "./lib/prisma";

async function main() {
  await prisma.$connect();

  console.log("✅ Database connected!");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
});