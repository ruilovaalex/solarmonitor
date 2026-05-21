ALTER TABLE "readings"
  ADD COLUMN "gridImportKwh" DECIMAL(12,3),
  ADD COLUMN "gridExportKwh" DECIMAL(12,3),
  ADD COLUMN "selfConsumptionKwh" DECIMAL(12,3);

UPDATE "readings"
SET
  "selfConsumptionKwh" = LEAST(COALESCE("generationKwh", "energy", 0), COALESCE("consumptionKwh", 0)),
  "gridImportKwh" = GREATEST(COALESCE("consumptionKwh", 0) - COALESCE("generationKwh", "energy", 0), 0),
  "gridExportKwh" = GREATEST(COALESCE("generationKwh", "energy", 0) - COALESCE("consumptionKwh", 0), 0)
WHERE
  "selfConsumptionKwh" IS NULL
  OR "gridImportKwh" IS NULL
  OR "gridExportKwh" IS NULL;
