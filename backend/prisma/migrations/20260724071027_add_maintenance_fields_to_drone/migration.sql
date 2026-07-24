-- AlterTable
ALTER TABLE "drones" ADD COLUMN     "lastMaintenanceAt" TIMESTAMPTZ,
ADD COLUMN     "nextMaintenanceDue" TIMESTAMPTZ;
