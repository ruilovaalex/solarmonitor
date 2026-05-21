import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | undefined;
  unit: string;
  trend: number | undefined;
  icon: LucideIcon;
  variant: "generation" | "consumption" | "balance" | "gridImport" | "gridExport" | "selfConsumption";
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  icon: Icon,
  variant,
  isLoading,
}: MetricCardProps) {
  const getColors = () => {
    switch (variant) {
      case "generation":
        return {
          icon: "text-emerald-500",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          progress: "bg-emerald-500",
          text: "text-emerald-700",
        };
      case "consumption":
        return {
          icon: "text-orange-500",
          bg: "bg-orange-50",
          border: "border-orange-200",
          progress: "bg-orange-500",
          text: "text-orange-700",
        };
      case "balance":
        return {
          icon: "text-blue-500",
          bg: "bg-blue-50",
          border: "border-blue-200",
          progress: "bg-blue-500",
          text: "text-blue-700",
        };
      case "gridImport":
        return {
          icon: "text-red-500",
          bg: "bg-red-50",
          border: "border-red-200",
          progress: "bg-red-500",
          text: "text-red-700",
        };
      case "gridExport":
        return {
          icon: "text-cyan-500",
          bg: "bg-cyan-50",
          border: "border-cyan-200",
          progress: "bg-cyan-500",
          text: "text-cyan-700",
        };
      case "selfConsumption":
        return {
          icon: "text-violet-500",
          bg: "bg-violet-50",
          border: "border-violet-200",
          progress: "bg-violet-500",
          text: "text-violet-700",
        };
    }
  };

  const colors = getColors();

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className={cn("overflow-hidden border border-slate-200 shadow-sm rounded-2xl p-5 bg-white", isLoading && "animate-pulse")}>
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <Icon className={cn("w-5 h-5", colors.icon)} />
          </div>
          {trend !== undefined && (
            <span className={cn(
              "text-xs font-bold flex items-center gap-1",
              trend >= 0 ? (variant === "consumption" ? "text-red-500" : "text-emerald-600") : (variant === "consumption" ? "text-emerald-600" : "text-red-500")
            )}>
              {trend >= 0 ? "Sube" : "Baja"} {Math.abs(trend)}%
            </span>
          )}
        </div>
        
        <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
        
        <div className="flex items-baseline gap-1 mt-1">
          <span className={cn("text-2xl font-bold", variant === "balance" && "text-blue-600")}>
            {value !== undefined ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </span>
          <span className="text-slate-400 text-sm font-medium">{unit}</span>
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "70%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full rounded-full shadow-inner", colors.progress)}
          />
        </div>
      </Card>
  );
}
