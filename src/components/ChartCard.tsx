import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, Clock, LineChart as LineIcon } from "lucide-react";
import { EnergyData, TimeRange } from "@/types";

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number | string }>;
  label?: string | number;
};

interface ChartCardProps {
  data: EnergyData[] | undefined;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  isLoading?: boolean;
}

const series = [
  { key: "generation", name: "Generacion", color: "#10b981" },
  { key: "consumption", name: "Consumo", color: "#f59e0b" },
] as const;

export function ChartCard({ data, range, onRangeChange, isLoading }: ChartCardProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const chartData = data ?? [];

  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg min-w-44">
        <p className="text-xs font-semibold mb-2 text-slate-500">
          {new Date(label ?? Date.now()).toLocaleString(undefined, {
            dateStyle: range === "day" ? undefined : "short",
            timeStyle: range === "day" ? "short" : undefined,
          })}
        </p>
        <div className="space-y-1">
          {payload.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium" style={{ color: item.color }}>
                {item.name}
              </span>
              <span className="text-xs font-bold">{Number(item.value ?? 0).toFixed(3)} kWh</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pb-6">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <LineIcon className="w-5 h-5 text-blue-500" />
            Generacion vs Consumo
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Comparativa principal del sistema fotovoltaico</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border">
          <Tabs value={range} onValueChange={(v) => onRangeChange(v as TimeRange)}>
            <TabsList className="h-8">
              <TabsTrigger value="day" className="text-xs h-7">
                Dia
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs h-7">
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs h-7">
                Mes
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          <div className="flex gap-1">
            <Button variant={chartType === "line" ? "secondary" : "ghost"} size="icon" className="w-8 h-8" onClick={() => setChartType("line")}>
              <LineIcon className="w-4 h-4" />
            </Button>
            <Button variant={chartType === "bar" ? "secondary" : "ghost"} size="icon" className="w-8 h-8" onClick={() => setChartType("bar")}>
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[380px] w-full">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-lg animate-pulse">
              <Clock className="w-8 h-8 text-slate-200 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatTick(range)} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  {series.map((item) => (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.name}
                      stroke={item.color}
                      strokeWidth={item.key === "generation" || item.key === "consumption" ? 3 : 2}
                      dot={range !== "day"}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatTick(range)} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  {series.map((item) => (
                    <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTick(range: TimeRange) {
  return (val: string) => {
    const date = new Date(val);
    return range === "day" ? `${date.getHours()}:00` : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  };
}
