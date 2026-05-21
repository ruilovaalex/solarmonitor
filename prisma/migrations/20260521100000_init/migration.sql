CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR', 'VIEWER');

CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "devices" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "location" TEXT,
  "ipAddress" TEXT,
  "capacityKw" DECIMAL(8,2),
  "status" "DeviceStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "readings" (
  "id" TEXT NOT NULL,
  "deviceId" TEXT NOT NULL,
  "voltage" DECIMAL(10,3) NOT NULL,
  "current" DECIMAL(10,3) NOT NULL,
  "power" DECIMAL(10,3) NOT NULL,
  "energy" DECIMAL(12,3),
  "temperature" DECIMAL(6,2),
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "readings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE INDEX "readings_deviceId_recordedAt_idx" ON "readings"("deviceId", "recordedAt");

ALTER TABLE "readings"
  ADD CONSTRAINT "readings_deviceId_fkey"
  FOREIGN KEY ("deviceId")
  REFERENCES "devices"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
