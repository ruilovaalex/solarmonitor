export interface EnergyData {
  timestamp: string;
  consumption: number;
  generation: number;
  gridImport: number;
  gridExport: number;
  selfConsumption: number;
}

export interface MetricSummary {
  totalConsumption: number;
  totalGeneration: number;
  balance: number;
  gridImport: number;
  gridExport: number;
  selfConsumption: number;
  selfConsumptionRate: number;
  consumptionTrend: number;
  generationTrend: number;
  balanceTrend: number;
}

export type TimeRange = "day" | "week" | "month";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export interface SystemConfig {
  name: string;
  location: string;
  capacityKW: number;
  updateInterval: number;
}
