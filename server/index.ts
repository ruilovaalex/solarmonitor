import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { prisma } from "./db";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const deviceIngestToken = process.env.DEVICE_INGEST_TOKEN;

const rangeHours = {
  day: 24,
  week: 24 * 7,
  month: 24 * 30,
} as const;

type TimeRange = keyof typeof rangeHours;

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, database: "connected" });
});

app.get("/api/devices", async (_req, res) => {
  const devices = await prisma.device.findMany({
    orderBy: { createdAt: "asc" },
  });

  res.json(devices);
});

app.get("/api/device-config", async (_req, res) => {
  const device = await prisma.device.findFirst({
    orderBy: { createdAt: "asc" },
  });

  res.json({
    id: device?.id ?? "demo-esp32",
    name: device?.name ?? "ESP32 Panel Solar",
    location: device?.location ?? "Laboratorio",
    ipAddress: device?.ipAddress ?? "192.168.1.50",
    capacityKw: Number(device?.capacityKw ?? 0.1),
    status: device?.status ?? "ACTIVE",
  });
});

const deviceConfigSchema = z.object({
  id: z.string().default("demo-esp32"),
  name: z.string().min(1),
  location: z.string().optional(),
  ipAddress: z.string().min(7),
  capacityKw: z.coerce.number().nonnegative().optional(),
});

app.put("/api/device-config", async (req, res) => {
  const payload = deviceConfigSchema.parse(req.body);

  const device = await prisma.device.upsert({
    where: { id: payload.id },
    update: {
      name: payload.name,
      location: payload.location,
      ipAddress: payload.ipAddress,
      capacityKw: payload.capacityKw,
    },
    create: {
      id: payload.id,
      name: payload.name,
      location: payload.location,
      ipAddress: payload.ipAddress,
      capacityKw: payload.capacityKw,
    },
  });

  res.json(device);
});

app.post("/api/device-config/test", async (req, res) => {
  const payload = z.object({ ipAddress: z.string().min(7) }).parse(req.body);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`http://${payload.ipAddress}/data`, {
      signal: controller.signal,
    });

    res.json({
      ok: response.ok,
      status: response.status,
      endpoint: `http://${payload.ipAddress}/data`,
    });
  } catch {
    res.status(502).json({
      ok: false,
      endpoint: `http://${payload.ipAddress}/data`,
      message: "No se pudo conectar al ESP32. Verifica que este en la misma red y exponga /data.",
    });
  } finally {
    clearTimeout(timeout);
  }
});

app.get("/api/readings", async (req, res) => {
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId : undefined;
  const limit = Math.min(Number(req.query.limit ?? 100), 500);

  const readings = await prisma.reading.findMany({
    where: deviceId ? { deviceId } : undefined,
    orderBy: { recordedAt: "desc" },
    take: limit,
  });

  res.json(readings.reverse());
});

app.get("/api/energy-data", async (req, res) => {
  const range = isTimeRange(req.query.range) ? req.query.range : "day";
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId : undefined;
  const since = new Date(Date.now() - rangeHours[range] * 60 * 60 * 1000);

  const readings = await prisma.reading.findMany({
    where: {
      recordedAt: { gte: since },
      ...(deviceId ? { deviceId } : {}),
    },
    orderBy: { recordedAt: "asc" },
  });

  res.json(
    readings.map((reading) => ({
      timestamp: reading.recordedAt.toISOString(),
      generation: Number(reading.generationKwh ?? reading.energy ?? 0),
      consumption: Number(reading.consumptionKwh ?? 0),
      gridImport: Number(reading.gridImportKwh ?? 0),
      gridExport: Number(reading.gridExportKwh ?? 0),
      selfConsumption: Number(reading.selfConsumptionKwh ?? 0),
    })),
  );
});

app.get("/api/metric-summary", async (req, res) => {
  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId : undefined;
  const since = new Date(Date.now() - rangeHours.day * 60 * 60 * 1000);

  const readings = await prisma.reading.findMany({
    where: {
      recordedAt: { gte: since },
      ...(deviceId ? { deviceId } : {}),
    },
  });

  const totalGeneration = readings.reduce((sum, reading) => {
    return sum + Number(reading.generationKwh ?? reading.energy ?? 0);
  }, 0);
  const totalConsumption = readings.reduce((sum, reading) => {
    return sum + Number(reading.consumptionKwh ?? 0);
  }, 0);
  const gridImport = readings.reduce((sum, reading) => {
    return sum + Number(reading.gridImportKwh ?? 0);
  }, 0);
  const gridExport = readings.reduce((sum, reading) => {
    return sum + Number(reading.gridExportKwh ?? 0);
  }, 0);
  const selfConsumption = readings.reduce((sum, reading) => {
    return sum + Number(reading.selfConsumptionKwh ?? 0);
  }, 0);
  const balance = totalGeneration - totalConsumption;
  const selfConsumptionRate = totalGeneration > 0 ? (selfConsumption / totalGeneration) * 100 : 0;

  res.json({
    totalConsumption: Number(totalConsumption.toFixed(2)),
    totalGeneration: Number(totalGeneration.toFixed(2)),
    balance: Number(balance.toFixed(2)),
    gridImport: Number(gridImport.toFixed(2)),
    gridExport: Number(gridExport.toFixed(2)),
    selfConsumption: Number(selfConsumption.toFixed(2)),
    selfConsumptionRate: Number(selfConsumptionRate.toFixed(1)),
    consumptionTrend: 0,
    generationTrend: 0,
    balanceTrend: 0,
  });
});

const readingSchema = z.object({
  deviceId: z.string().default("demo-esp32"),
  voltage: z.coerce.number().nonnegative(),
  current: z.coerce.number().nonnegative(),
  power: z.coerce.number().nonnegative(),
  energy: z.coerce.number().nonnegative().optional(),
  generationKwh: z.coerce.number().nonnegative().optional(),
  consumptionKwh: z.coerce.number().nonnegative().optional(),
  gridImportKwh: z.coerce.number().nonnegative().optional(),
  gridExportKwh: z.coerce.number().nonnegative().optional(),
  selfConsumptionKwh: z.coerce.number().nonnegative().optional(),
  generationPowerW: z.coerce.number().nonnegative().optional(),
  consumptionPowerW: z.coerce.number().nonnegative().optional(),
  batteryVoltage: z.coerce.number().nonnegative().optional(),
  temperature: z.coerce.number().optional(),
  recordedAt: z.coerce.date().optional(),
});

app.post("/api/readings", async (req, res) => {
  if (!deviceIngestToken || req.header("x-device-token") !== deviceIngestToken) {
    res.status(401).json({ error: "Invalid device token" });
    return;
  }

  const payload = readingSchema.parse(req.body);
  const generationPowerW = payload.generationPowerW ?? payload.power;
  const consumptionPowerW = payload.consumptionPowerW ?? 0;
  const generationKwh = payload.generationKwh ?? payload.energy ?? generationPowerW / 1000;
  const consumptionKwh = payload.consumptionKwh ?? consumptionPowerW / 1000;
  const selfConsumptionKwh = payload.selfConsumptionKwh ?? Math.min(generationKwh, consumptionKwh);
  const gridImportKwh = payload.gridImportKwh ?? Math.max(consumptionKwh - generationKwh, 0);
  const gridExportKwh = payload.gridExportKwh ?? Math.max(generationKwh - consumptionKwh, 0);

  const reading = await prisma.reading.create({
    data: {
      deviceId: payload.deviceId,
      voltage: payload.voltage,
      current: payload.current,
      power: payload.power,
      energy: payload.energy,
      generationKwh,
      consumptionKwh,
      gridImportKwh,
      gridExportKwh,
      selfConsumptionKwh,
      generationPowerW,
      consumptionPowerW,
      batteryVoltage: payload.batteryVoltage,
      temperature: payload.temperature,
      recordedAt: payload.recordedAt,
    },
  });

  res.status(201).json(reading);
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: "Invalid request body", details: error.flatten() });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`SolarMonitor API listening on http://localhost:${port}`);
});

function isTimeRange(value: unknown): value is TimeRange {
  return value === "day" || value === "week" || value === "month";
}
