ALTER TABLE "devices"
  ADD COLUMN "macAddress" TEXT,
  ADD COLUMN "firmwareVersion" TEXT,
  ADD COLUMN "mqttTopic" TEXT,
  ADD COLUMN "panelModel" TEXT,
  ADD COLUMN "sensorModel" TEXT;

ALTER TABLE "readings"
  ADD COLUMN "batteryCurrent" DECIMAL(10,3),
  ADD COLUMN "batteryPowerW" DECIMAL(10,3),
  ADD COLUMN "batterySoc" DECIMAL(5,2),
  ADD COLUMN "panelTemperature" DECIMAL(6,2),
  ADD COLUMN "ambientTemperature" DECIMAL(6,2),
  ADD COLUMN "irradianceWm2" DECIMAL(10,3),
  ADD COLUMN "wifiRssi" INTEGER,
  ADD COLUMN "uptimeSeconds" INTEGER;
