import { BatteryCharging, Download, Upload } from "lucide-react";
import { MetricSummary } from "@/types";

interface EnergyFlowSummaryProps {
  metrics: MetricSummary | undefined;
  isLoading?: boolean;
}

const formatKwh = (value: number | undefined) =>
  (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function EnergyFlowSummary({ metrics, isLoading }: EnergyFlowSummaryProps) {
  const items = [
    {
      title: "Autoconsumo",
      value: `${formatKwh(metrics?.selfConsumption)} kWh`,
      detail: `${(metrics?.selfConsumptionRate ?? 0).toFixed(1)}% de la generacion`,
      icon: BatteryCharging,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Importado de Red",
      value: `${formatKwh(metrics?.gridImport)} kWh`,
      detail: "Energia tomada de la red",
      icon: Download,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Exportado a Red",
      value: `${formatKwh(metrics?.gridExport)} kWh`,
      detail: "Excedente solar disponible",
      icon: Upload,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Detalle del flujo energetico</h3>
        <p className="text-sm text-slate-500">Autoconsumo, energia tomada de red y excedentes disponibles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`${item.bg} ${item.color} rounded-lg p-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-600">{item.title}</p>
                  {isLoading ? (
                    <div className="mt-2 h-6 w-24 rounded bg-slate-100 animate-pulse" />
                  ) : (
                    <p className="text-xl font-black text-slate-900">{item.value}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
