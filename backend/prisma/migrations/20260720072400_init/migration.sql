-- CreateEnum
CREATE TYPE "DroneStatus" AS ENUM ('ONLINE', 'OFFLINE', 'IN_FLIGHT', 'CHARGING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'FAILED', 'ABORTED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LOW_BATTERY', 'GPS_SIGNAL', 'COMMUNICATION', 'SYSTEM', 'OBSTACLE');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('ROUTINE', 'REPAIR', 'INSPECTION', 'FIRMWARE_UPDATE', 'BATTERY_REPLACEMENT', 'PROPELLER_REPLACEMENT', 'MOTOR_SERVICE', 'CALIBRATION');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drones" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "status" "DroneStatus" NOT NULL DEFAULT 'OFFLINE',
    "firmwareVersion" TEXT,
    "batteryLevel" SMALLINT NOT NULL DEFAULT 100,
    "batteryHealth" SMALLINT,
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "altitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "speed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "heading" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payloadCapacity" DOUBLE PRECISION,
    "camera" TEXT,
    "weight" DOUBLE PRECISION,
    "maxFlightTime" INTEGER,
    "maxSpeed" DOUBLE PRECISION,
    "lastSeenAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetry" (
    "id" TEXT NOT NULL,
    "droneId" TEXT NOT NULL,
    "batteryLevel" SMALLINT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "altitude" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "windSpeed" DOUBLE PRECISION,
    "signalStrength" SMALLINT,
    "gpsAccuracy" DOUBLE PRECISION,
    "recordedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "droneId" TEXT NOT NULL,
    "status" "MissionStatus" NOT NULL DEFAULT 'PLANNED',
    "plannedStartAt" TIMESTAMPTZ,
    "actualStartAt" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    "plannedRoute" JSONB,
    "actualRoute" JSONB,
    "waypoints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "droneId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "description" TEXT,
    "performedBy" TEXT,
    "cost" DECIMAL(10,2),
    "scheduledAt" TIMESTAMPTZ NOT NULL,
    "startedAt" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    "nextDueAt" TIMESTAMPTZ,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "droneId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "acknowledgedAt" TIMESTAMPTZ,
    "acknowledgedBy" TEXT,
    "resolvedAt" TIMESTAMPTZ,
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_name_key" ON "manufacturers"("name");

-- CreateIndex
CREATE INDEX "manufacturers_name_idx" ON "manufacturers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "drones_serialNumber_key" ON "drones"("serialNumber");

-- CreateIndex
CREATE INDEX "drones_manufacturerId_idx" ON "drones"("manufacturerId");

-- CreateIndex
CREATE INDEX "drones_status_idx" ON "drones"("status");

-- CreateIndex
CREATE INDEX "drones_lastSeenAt_idx" ON "drones"("lastSeenAt");

-- CreateIndex
CREATE INDEX "drones_serialNumber_idx" ON "drones"("serialNumber");

-- CreateIndex
CREATE INDEX "telemetry_droneId_recordedAt_idx" ON "telemetry"("droneId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "telemetry_recordedAt_idx" ON "telemetry"("recordedAt" DESC);

-- CreateIndex
CREATE INDEX "missions_droneId_idx" ON "missions"("droneId");

-- CreateIndex
CREATE INDEX "missions_status_idx" ON "missions"("status");

-- CreateIndex
CREATE INDEX "missions_plannedStartAt_idx" ON "missions"("plannedStartAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_records_droneId_idx" ON "maintenance_records"("droneId");

-- CreateIndex
CREATE INDEX "maintenance_records_status_idx" ON "maintenance_records"("status");

-- CreateIndex
CREATE INDEX "maintenance_records_scheduledAt_idx" ON "maintenance_records"("scheduledAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_records_nextDueAt_idx" ON "maintenance_records"("nextDueAt" ASC);

-- CreateIndex
CREATE INDEX "alerts_droneId_idx" ON "alerts"("droneId");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_createdAt_idx" ON "alerts"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "alerts_acknowledgedAt_idx" ON "alerts"("acknowledgedAt" DESC);

-- AddForeignKey
ALTER TABLE "drones" ADD CONSTRAINT "drones_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "manufacturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "drones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "drones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "drones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_droneId_fkey" FOREIGN KEY ("droneId") REFERENCES "drones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
