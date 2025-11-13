import { useEffect, useState } from "react";
import { pingGateway, pingService, listServices, type HealthResponse } from "@/services/health.service";

type Item = { id: string; result?: HealthResponse; error?: string; loading: boolean };

export default function StatusPage() {
  const [gateway, setGateway] = useState<Item>({ id: "gateway", loading: true });
  const [services, setServices] = useState<Item[]>(() => listServices().map(id => ({ id, loading: true })));

  useEffect(() => {
    (async () => {
      try {
        const res = await pingGateway();
        setGateway({ id: "gateway", result: res, loading: false });
      } catch (e: any) {
        setGateway({ id: "gateway", error: e?.message || "error", loading: false });
      }

      const checks = await Promise.allSettled(services.map(s => pingService(s.id as any)));
      setServices(prev =>
        prev.map((s, i) => {
          const r = checks[i];
          if (r.status === "fulfilled") return { id: s.id, result: (r as PromiseFulfilledResult<HealthResponse>).value, loading: false };
          return { id: s.id, error: (r as any).reason?.message || "error", loading: false };
        })
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pill = (ok?: boolean) =>
    ok ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300";

  const Card = ({ item }: { item: Item }) => {
    const ok = !!item.result && item.result.status === "ok";
    return (
      <div className="rounded-xl border p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold capitalize">{item.id}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${pill(ok)}`}>
            {item.loading ? "checking..." : ok ? "OK" : "FAIL"}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          {item.result && (
            <>
              <div>name: {item.result.name}</div>
              <div>time: {item.result.time}</div>
              {typeof item.result.uptime !== "undefined" && <div>uptime: {item.result.uptime}s</div>}
              {item.result.version && <div>version: {item.result.version}</div>}
              {item.result.db && <div>db: {item.result.db.status}</div>}
            </>
          )}
          {item.error && <div className="text-red-600">{item.error}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Conectividad</h1>
        <p className="text-slate-600">Verifica conexión con el API Gateway y microservicios.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">API Gateway</h2>
        <Card item={gateway} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Microservicios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => <Card key={s.id} item={s} />)}
        </div>
      </section>
    </div>
  );
}

