import { http } from "@/lib/http";

export type HealthResponse = {
  name: string;
  status: "ok" | "fail";
  time: string;
  uptime?: number;
  version?: string;
  db?: { status: "ok" | "fail" } | null;
};

export const pingGateway = async () => {
  const { data } = await http.get<HealthResponse>("/health");
  return data;
};

// Prefijos expuestos por el gateway. Ajusta si usas /api/*
const SERVICES = ["auth", "users", "appointments", "schedules", "diagnostic", "queue"] as const;

export const pingService = async (svc: (typeof SERVICES)[number]) => {
  const { data } = await http.get<HealthResponse>(`/${svc}/health`);
  return data;
};

export const listServices = () => SERVICES;

