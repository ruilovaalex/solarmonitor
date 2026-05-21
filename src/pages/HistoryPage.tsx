import { useState } from "react";
import { AlertCircle, CheckCircle2, Download, Filter } from "lucide-react";
import { ChartCard } from "@/components/ChartCard";
import { useEnergyData } from "@/hooks/useEnergyData";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TimeRange } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const rangeLabels: Record<TimeRange, string> = {
  day: "Dia",
  week: "Semana",
  month: "Mes",
};

export function HistoryPage() {
  const [range, setRange] = useState<TimeRange>("day");
  const { data, isLoading } = useEnergyData(range);

  const handleExport = () => {
    if (!data?.length) {
      toast.info("No hay datos para exportar");
      return;
    }

    const rows = [
      ["fecha_hora", "generacion_kwh", "consumo_kwh", "balance_kwh", "autoconsumo_kwh", "importado_red_kwh", "exportado_red_kwh"],
      ...data.map((item) => {
        const balance = item.generation - item.consumption;
        return [
          new Date(item.timestamp).toISOString(),
          item.generation.toFixed(3),
          item.consumption.toFixed(3),
          balance.toFixed(3),
          item.selfConsumption.toFixed(3),
          item.gridImport.toFixed(3),
          item.gridExport.toFixed(3),
        ];
      }),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `solarmonitor-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Historial exportado");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Historial Energetico</h2>
          <p className="text-sm text-slate-500 font-medium">Registros historicos del sistema fotovoltaico</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={range} onValueChange={(value) => setRange(value as TimeRange)}>
              <SelectTrigger className="h-9 border-none px-1 shadow-none">
                <SelectValue>{rangeLabels[range]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Dia</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2" onClick={handleExport} disabled={isLoading || !data?.length}>
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      <ChartCard data={data} range={range} onRangeChange={setRange} isLoading={isLoading} />

      <Card className="shadow-sm border border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold">Fecha / Hora</TableHead>
                <TableHead className="font-bold">Generacion (kWh)</TableHead>
                <TableHead className="font-bold">Consumo (kWh)</TableHead>
                <TableHead className="font-bold">Balance (kWh)</TableHead>
                <TableHead className="font-bold">Autoconsumo</TableHead>
                <TableHead className="font-bold">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 bg-slate-100 animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                data?.map((item) => {
                  const balance = item.generation - item.consumption;
                  const isPositive = balance >= 0;

                  return (
                    <TableRow key={item.timestamp} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-600">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell className="text-emerald-600 font-bold">{item.generation.toFixed(3)}</TableCell>
                      <TableCell className="text-orange-600 font-bold">{item.consumption.toFixed(3)}</TableCell>
                      <TableCell className={isPositive ? "text-blue-600 font-bold" : "text-red-500 font-bold"}>{balance.toFixed(3)}</TableCell>
                      <TableCell className="text-violet-600 font-bold">{item.selfConsumption.toFixed(3)}</TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold inline-flex ${
                            isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isPositive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {isPositive ? "Excedente" : "Deficit"}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
