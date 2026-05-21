import { useState } from "react";
import { motion } from "motion/react";
import { RefreshCw, Scale, Sun, Zap } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import { EnergyFlowSummary } from "@/components/EnergyFlowSummary";
import { SystemStatus } from "@/components/SystemStatus";
import { useMetricSummary } from "@/hooks/useMetricSummary";
import { useEnergyData } from "@/hooks/useEnergyData";
import { Button } from "@/components/ui/button";
import { TimeRange } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const [range, setRange] = useState<TimeRange>("day");
  const { data: metrics, isLoading: metricsLoading, refresh: refreshMetrics } = useMetricSummary();
  const { data: graphData, isLoading: graphLoading, refresh: refreshGraph } = useEnergyData(range);

  const handleRefresh = () => {
    refreshMetrics();
    refreshGraph();
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <motion.div variants={item}>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Monitor Fotovoltaico</h2>
          <p className="text-sm text-slate-500 font-medium">Resumen principal de generacion, consumo y balance</p>
        </motion.div>

        <motion.div variants={item}>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="bg-white hover:shadow-md border-slate-200 text-slate-700 font-semibold gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${metricsLoading || graphLoading ? "animate-spin" : ""}`} />
            Actualizar Datos
          </Button>
        </motion.div>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <MetricCard
          title="Generacion Solar"
          value={metrics?.totalGeneration}
          unit="kWh"
          trend={metrics?.generationTrend}
          icon={Sun}
          variant="generation"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Consumo Total"
          value={metrics?.totalConsumption}
          unit="kWh"
          trend={metrics?.consumptionTrend}
          icon={Zap}
          variant="consumption"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Balance Energetico"
          value={metrics?.balance}
          unit="kWh"
          trend={metrics?.balanceTrend}
          icon={Scale}
          variant="balance"
          isLoading={metricsLoading}
        />
      </motion.div>

      <motion.div variants={item}>
        <ChartCard data={graphData} range={range} onRangeChange={setRange} isLoading={graphLoading} />
      </motion.div>

      <motion.div variants={item}>
        <EnergyFlowSummary metrics={metrics} isLoading={metricsLoading} />
      </motion.div>

      <motion.div variants={item}>
        <SystemStatus />
      </motion.div>

      <motion.div
        variants={item}
        className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/10 border border-white/10"
      >
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
            Gestion Energetica Local
          </div>
          <h3 className="text-3xl font-black leading-tight">Gestion del sistema fotovoltaico</h3>
          <p className="text-lg opacity-80 leading-relaxed font-medium">
            El sistema registra generacion solar, consumo, autoconsumo e intercambio con la red. Por ahora trabaja
            con datos demo persistidos en PostgreSQL; despues el backend podra consultar el ESP32 por IP o recibir
            sus lecturas por HTTP.
          </p>
        </div>
        <Sun className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 blur-xl" />
      </motion.div>
    </motion.div>
  );
}
