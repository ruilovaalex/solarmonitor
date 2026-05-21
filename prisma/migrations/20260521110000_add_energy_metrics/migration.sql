ALTER TABLE "readings"
  ADD COLUMN "generationKwh" DECIMAL(12,3),
  ADD COLUMN "consumptionKwh" DECIMAL(12,3),
  ADD COLUMN "generationPowerW" DECIMAL(10,3),
  ADD COLUMN "consumptionPowerW" DECIMAL(10,3),
  ADD COLUMN "batteryVoltage" DECIMAL(10,3);

UPDATE "readings"
SET
  "generationKwh" = COALESCE("energy", "power" / 1000),
  "consumptionKwh" = 0,
  "generationPowerW" = "power",
  "consumptionPowerW" = 0
WHERE
  "generationKwh" IS NULL
  OR "consumptionKwh" IS NULL
  OR "generationPowerW" IS NULL
  OR "consumptionPowerW" IS NULL;
