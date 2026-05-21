# SolarMonitor

App web para monitoreo fotovoltaico con frontend React, backend Node/Express y base de datos PostgreSQL local.

## Requisitos

- Node.js 20+
- Docker Desktop, para levantar PostgreSQL local

## Configuracion local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` desde `.env.example`.

Este proyecto ya usa estos valores locales por defecto:

```env
DATABASE_URL="postgresql://solarmonitor:solarmonitor@localhost:5432/solarmonitor"
DEVICE_INGEST_TOKEN="local_device_token_change_before_demo"
```

3. Levantar PostgreSQL:

```bash
npm run db:up
```

4. Crear tablas y ejecutar migraciones:

```bash
npm run db:migrate
```

5. Insertar usuario y datos demo:

```bash
npm run db:seed
```

6. Ejecutar backend:

```bash
npm run dev:api
```

7. Ejecutar frontend:

```bash
npm run dev
```

## Endpoints iniciales

Backend local:

```text
http://localhost:4000/api
```

Salud de API y base:

```bash
curl http://localhost:4000/api/health
```

Registrar lectura desde ESP32:

```bash
curl -X POST http://localhost:4000/api/readings \
  -H "Content-Type: application/json" \
  -H "x-device-token: local_device_token_change_before_demo" \
  -d "{\"deviceId\":\"demo-esp32\",\"voltage\":18.5,\"current\":2.1,\"power\":38.85,\"energy\":0.04,\"generationKwh\":0.04,\"consumptionKwh\":0.03,\"generationPowerW\":38.85,\"consumptionPowerW\":30.0,\"batteryVoltage\":12.5,\"temperature\":31.2}"
```

Consultar lecturas:

```bash
curl http://localhost:4000/api/readings?deviceId=demo-esp32
```

Consultar datos del dashboard:

```bash
curl "http://localhost:4000/api/energy-data?range=day"
curl http://localhost:4000/api/metric-summary
```

## Credenciales demo

```text
Email: admin@solarmonitor.local
Password: admin123
```

## Flujo del ESP32

El ESP32 debe enviar lecturas por WiFi al backend usando HTTP. El servidor valida el header `x-device-token` antes de guardar datos.

```text
ESP32 -> POST /api/readings -> PostgreSQL -> Frontend
```

Campos principales a guardar:

- `generationKwh`: energia generada por el panel en el intervalo.
- `consumptionKwh`: energia consumida por la carga/sistema en el intervalo.
- `selfConsumptionKwh`: parte de la generacion solar usada directamente por el sistema.
- `gridImportKwh`: energia que falta y se toma de la red.
- `gridExportKwh`: excedente solar disponible para exportar o almacenar.
- `generationPowerW`: potencia instantanea generada.
- `consumptionPowerW`: potencia instantanea consumida.
- `voltage`, `current`, `power`, `batteryVoltage`, `temperature`: telemetria electrica y ambiental.

## Enfoque tipo IAMMETER

El dashboard se basa en el flujo energetico completo de un sistema fotovoltaico:

```text
Generacion solar -> Autoconsumo -> Consumo
                 -> Excedente/exportacion
Red electrica    -> Importacion cuando el consumo supera la generacion
```

Por ahora estos valores salen de datos demo guardados en PostgreSQL. Cuando se conecte el ESP32, el backend podra guardar las mismas columnas sin cambiar el dashboard.
