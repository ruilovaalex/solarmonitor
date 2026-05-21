import { Zap } from "lucide-react";

export function SystemStatus() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eficiencia</span>
          <span className="text-sm font-bold">87.4%</span>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inversor</span>
          <span className="text-sm font-bold">Operativo</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actualización</span>
          <span className="text-sm font-bold">Hace 2m</span>
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Modo Demo</span>
          <span className="text-[11px] text-amber-800 leading-tight font-medium">Datos Simulados</span>
        </div>
        <Zap className="w-4 h-4 text-amber-500 opacity-60" />
      </div>
    </div>
  );
}
