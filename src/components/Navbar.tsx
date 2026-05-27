import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { fetchDeviceStatus, logout } from "@/services/api";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";

interface NavbarProps {
  user: User | null;
  onMenuClick?: () => void;
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { data: deviceStatus, isLoading } = useSWR("device-status", fetchDeviceStatus, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });
  const isEsp32Connected = deviceStatus?.connected === true;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
        <div className="hidden md:flex flex-col">
          <h1 className="text-sm font-bold text-slate-900 leading-none">Dashboard</h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Resumen Energético</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div
          className={`hidden sm:flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full border uppercase tracking-widest ${
            isEsp32Connected
              ? "text-emerald-600 bg-emerald-50 border-emerald-100"
              : "text-slate-500 bg-slate-50 border-slate-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isEsp32Connected ? "bg-emerald-500 animate-pulse" : isLoading ? "bg-amber-400 animate-pulse" : "bg-slate-300"
            }`}
          ></span>
          {isEsp32Connected ? "Panel Conectado" : isLoading ? "Verificando Panel" : "Panel Desconectado"}
        </div>

        <div className="flex items-center gap-3 border-l border-slate-100 pl-4 md:pl-6">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs font-bold text-slate-900">{user?.name}</p>
            <p className="text-[10px] text-slate-400">{user?.email}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shadow-inner">
            {user?.name?.substring(0, 2).toUpperCase()}
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 transition-colors w-8 h-8" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
