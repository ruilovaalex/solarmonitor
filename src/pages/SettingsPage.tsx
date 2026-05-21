import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Cpu, Database, Globe, Info, Loader2, Save, ShieldCheck, User as UserIcon, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

type DeviceConfig = {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  capacityKw: number;
  status: string;
};

export function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [deviceMode, setDeviceMode] = useState("demo");
  const [databaseStatus, setDatabaseStatus] = useState<"checking" | "connected" | "error">("checking");
  const [device, setDevice] = useState<DeviceConfig>({
    id: "demo-esp32",
    name: "ESP32 Panel Solar",
    location: "Laboratorio",
    ipAddress: "192.168.1.50",
    capacityKw: 0.1,
    status: "ACTIVE",
  });

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [healthResponse, deviceResponse] = await Promise.all([
        fetch(`${API_URL}/health`),
        fetch(`${API_URL}/device-config`),
      ]);

      setDatabaseStatus(healthResponse.ok ? "connected" : "error");
      if (deviceResponse.ok) {
        setDevice(await deviceResponse.json());
      }
    } catch {
      setDatabaseStatus("error");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/device-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(device),
      });

      if (!response.ok) throw new Error("No se pudo guardar la configuracion");
      setDevice(await response.json());
      toast.success("Configuracion del ESP32 guardada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(`${API_URL}/device-config/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipAddress: device.ipAddress }),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        toast.error(result.message ?? "No se pudo conectar al ESP32");
        return;
      }

      toast.success(`ESP32 respondio en ${result.endpoint}`);
    } catch {
      toast.error("No se pudo probar la conexion");
    } finally {
      setIsTesting(false);
    }
  };

  const updateDevice = (field: keyof DeviceConfig, value: string | number) => {
    setDevice((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configuracion</h2>
        <p className="text-sm text-slate-500 font-medium">Base local, modo demo y preparacion de conexion ESP32</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-500" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input defaultValue="Admin User" />
              </div>
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input defaultValue="admin@solarmonitor.local" readOnly className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <div className="px-3 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-lg border border-emerald-100 inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Administrador
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 bg-slate-900 text-white overflow-hidden relative">
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-300" />
                Base Local
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="flex items-start gap-3 bg-white/10 p-3 rounded-lg border border-white/15">
                {databaseStatus === "connected" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-300" />
                ) : (
                  <Info className="w-5 h-5 shrink-0 text-amber-300" />
                )}
                <div>
                  <p className="text-sm font-bold">
                    {databaseStatus === "connected" ? "PostgreSQL conectado" : "Verificando PostgreSQL"}
                  </p>
                  <p className="text-xs leading-relaxed opacity-80">
                    Los datos demo y futuras lecturas del ESP32 se guardan en la base local.
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-300 bg-black/20 rounded-lg p-3 border border-white/10">
                API: {API_URL}
              </div>
            </CardContent>
            <Database className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-500" />
                Conexion ESP32
              </CardTitle>
              <CardDescription>Configuracion inicial para probar lecturas por red local</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modo de datos</Label>
                <Select value={deviceMode} onValueChange={setDeviceMode}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Demo desde PostgreSQL</SelectItem>
                    <SelectItem value="esp32">ESP32 por IP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ID del dispositivo</Label>
                <Input value={device.id} onChange={(event) => updateDevice("id", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nombre del dispositivo</Label>
                <Input value={device.name} onChange={(event) => updateDevice("name", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wifi className="w-3 h-3" /> IP del ESP32
                </Label>
                <Input value={device.ipAddress} placeholder="192.168.1.50" onChange={(event) => updateDevice("ipAddress", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Ubicacion
                </Label>
                <Input value={device.location ?? ""} onChange={(event) => updateDevice("location", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Capacidad de prueba (kW)</Label>
                <Input type="number" step="0.01" value={device.capacityKw} onChange={(event) => updateDevice("capacityKw", Number(event.target.value))} />
              </div>
              <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                Endpoint esperado del ESP32: <span className="font-mono text-slate-900">http://{device.ipAddress || "IP_ESP32"}/data</span>
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="gap-2" onClick={handleTestConnection} disabled={isTesting}>
                  {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                  Probar Conexion
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar ESP32
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                Alertas y Pruebas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activar Alertas</Label>
                  <p className="text-sm text-muted-foreground">Avisos sobre consumo alto o baja generacion demo</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label>Umbral Consumo Alto (kWh)</Label>
                  <Input type="number" defaultValue="8.0" />
                </div>
                <div className="space-y-2">
                  <Label>Umbral Baja Generacion (kWh)</Label>
                  <Input type="number" defaultValue="0.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
