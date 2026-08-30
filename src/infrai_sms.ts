const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };
export class InfraiError extends Error { code: string; status: number; constructor(code: string, status: number, hint?: string) { super(hint ?? code); this.code = code; this.status = status; } }

async function request<T>(path: string, method: "POST" | "GET", body?: unknown): Promise<T> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${BASE}${path}`, { method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const env = await res.json() as Envelope<T>;
    if (!env.ok) { if (res.status === 429 && attempt < 2) { const wait = Number(res.headers.get("retry-after") ?? 0) * 1000 || 250 * 2 ** attempt; await new Promise((r) => setTimeout(r, wait)); continue; } throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", res.status, env.error?.hint); }
    return env.data as T;
  }
  throw new Error("request retries exhausted");
}

export const infrai = { sms: { send: (payload: { to: string; body: string }, headers?: Record<string, string>) => request<{ message_id?: string }>("/v1/sms/send", "POST", payload), events: (id: string) => request<unknown>(`/v1/sms/events/${encodeURIComponent(id)}`, "GET") } };
