import { EnergyData, MetricSummary, TimeRange, User } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const fetchEnergyData = async (range: TimeRange): Promise<EnergyData[]> => {
  const response = await fetch(`${API_URL}/energy-data?range=${range}`);
  if (!response.ok) throw new Error("No se pudieron cargar los datos energeticos");
  return response.json();
};

export const fetchMetricSummary = async (): Promise<MetricSummary> => {
  const response = await fetch(`${API_URL}/metric-summary`);
  if (!response.ok) throw new Error("No se pudo cargar el resumen energetico");
  return response.json();
};

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800);
  if (!email || !password) throw new Error("Email y contrasena son obligatorios");
  if (password.length < 6) throw new Error("La contrasena debe tener al menos 6 caracteres");

  const user: User = {
    id: "1",
    email,
    name: email.split("@")[0],
    role: "admin",
  };

  sessionStorage.setItem("user", JSON.stringify(user));
  return user;
};

export const getCurrentUser = (): User | null => {
  const savedUser = sessionStorage.getItem("user");
  if (!savedUser) return null;

  try {
    const parsedUser = JSON.parse(savedUser) as Partial<User>;
    if (!parsedUser.id || !parsedUser.email || !parsedUser.name || !parsedUser.role) {
      sessionStorage.removeItem("user");
      return null;
    }

    return parsedUser as User;
  } catch {
    sessionStorage.removeItem("user");
    return null;
  }
};

export const logout = async (): Promise<void> => {
  await delay(300);
  sessionStorage.removeItem("user");
};
