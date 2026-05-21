import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@solarmonitor.local" },
    update: {},
    create: {
      email: "admin@solarmonitor.local",
      name: "Administrador",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const device = await prisma.device.upsert({
    where: { id: "demo-esp32" },
    update: {},
    create: {
      id: "demo-esp32",
      name: "ESP32 Panel Solar",
      location: "Laboratorio",
      ipAddress: "192.168.1.50",
      capacityKw: "0.10",
    },
  });

  const existingReadings = await prisma.reading.count({
    where: { deviceId: device.id },
  });

  if (existingReadings > 0) {
    const readings = await prisma.reading.findMany({
      where: { deviceId: device.id },
      orderBy: { recordedAt: "asc" },
    });

    await Promise.all(
      readings.map((reading) => {
        const hour = reading.recordedAt.getHours();
        const consumptionPowerW = 25 + Math.random() * 25 + (hour >= 18 && hour <= 22 ? 35 : 0);

        return prisma.reading.update({
          where: { id: reading.id },
          data: {
            generationKwh: reading.generationKwh ?? reading.energy ?? Number(reading.power) / 1000,
            consumptionKwh: Number(consumptionPowerW / 1000).toFixed(3),
            generationPowerW: reading.generationPowerW ?? reading.power,
            consumptionPowerW: consumptionPowerW.toFixed(3),
            selfConsumptionKwh: Math.min(Number(reading.generationKwh ?? reading.energy ?? 0), consumptionPowerW / 1000).toFixed(3),
            gridImportKwh: Math.max(consumptionPowerW / 1000 - Number(reading.generationKwh ?? reading.energy ?? 0), 0).toFixed(3),
            gridExportKwh: Math.max(Number(reading.generationKwh ?? reading.energy ?? 0) - consumptionPowerW / 1000, 0).toFixed(3),
            batteryVoltage: reading.batteryVoltage ?? (12 + Math.random()).toFixed(3),
          },
        });
      }),
    );
  } else {
    const now = Date.now();
    await prisma.reading.createMany({
      data: Array.from({ length: 24 }, (_, index) => {
        const hourOffset = 23 - index;
        const recordedAt = new Date(now - hourOffset * 60 * 60 * 1000);
        const hour = recordedAt.getHours();
        const daylightFactor = hour >= 6 && hour <= 18 ? 1 - Math.abs(12 - hour) / 6 : 0;
        const generationPowerW = Math.max(0, daylightFactor * 85);
        const consumptionPowerW = 25 + Math.random() * 25 + (hour >= 18 && hour <= 22 ? 35 : 0);
        const generationKwh = generationPowerW / 1000;
        const consumptionKwh = consumptionPowerW / 1000;

        return {
          deviceId: device.id,
          voltage: (generationPowerW > 0 ? 17.5 + Math.random() * 2 : 0).toFixed(3),
          current: (generationPowerW > 0 ? generationPowerW / 18 : 0).toFixed(3),
          power: generationPowerW.toFixed(3),
          energy: generationKwh.toFixed(3),
          generationKwh: generationKwh.toFixed(3),
          consumptionKwh: consumptionKwh.toFixed(3),
          selfConsumptionKwh: Math.min(generationKwh, consumptionKwh).toFixed(3),
          gridImportKwh: Math.max(consumptionKwh - generationKwh, 0).toFixed(3),
          gridExportKwh: Math.max(generationKwh - consumptionKwh, 0).toFixed(3),
          generationPowerW: generationPowerW.toFixed(3),
          consumptionPowerW: consumptionPowerW.toFixed(3),
          batteryVoltage: (12 + Math.random()).toFixed(3),
          temperature: (28 + Math.random() * 8).toFixed(2),
          recordedAt,
        };
      }),
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
