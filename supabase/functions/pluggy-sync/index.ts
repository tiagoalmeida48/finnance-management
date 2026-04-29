import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PLUGGY_API = "https://api.pluggy.ai";

const ALLOWED_ORIGINS = [
  "https://finnance-management.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed =
    ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".vercel.app")
      ? origin
      : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function json(body: unknown, status = 200, req?: Request) {
  const cors = req ? getCorsHeaders(req) : { "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0] };
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

async function getApiKey(): Promise<string> {
  const res = await fetch(`${PLUGGY_API}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId: Deno.env.get("PLUGGY_CLIENT_ID")!, clientSecret: Deno.env.get("PLUGGY_CLIENT_SECRET")! }),
  });
  if (!res.ok) throw new Error("Pluggy auth failed");
  return (await res.json()).apiKey;
}

function isPaymentTx(tx: Record<string, unknown>): boolean {
  const category = ((tx.category as string) ?? "").toLowerCase();
  const desc = ((tx.description as string) ?? "").toLowerCase();
  const type = ((tx.type as string) ?? "").toUpperCase();
  if (type === "PAYMENT") return true;
  if (category.includes("payment") || category.includes("pagamento")) return true;
  if (desc.includes("pagamento") || desc.includes("pag *") || desc.includes("payment")) return true;
  if (desc.includes("fatura") && (desc.includes("pag") || desc.includes("debito"))) return true;
  return false;
}

function resolveAmount(tx: Record<string, unknown>): number {
  const ainac = tx.amountInAccountCurrency;
  if (ainac !== undefined && ainac !== null && Number(ainac) !== 0) return Math.abs(Number(ainac));
  return Math.abs(Number(tx.amount));
}

function extractInstallmentFromDesc(desc: string): { current: number; total: number } | null {
  const match = desc.match(/\(?\b(\d+)\s*\/\s*(\d+)\b\)?/);
  if (!match) return null;
  return { current: Number(match[1]), total: Number(match[2]) };
}

function shouldSkipInstallment(tx: Record<string, unknown>): boolean {
  const paymentData = tx.paymentData as Record<string, unknown> | null;
  const desc = (tx.description as string) ?? "";
  if (paymentData) {
    const current = Number(paymentData.installmentNumber ?? 0);
    const total = Number(paymentData.totalInstallments ?? 1);
    if (total > 1 && current > 1) return true;
    if (total > 1 && current === 1) return false;
  }
  const parsed = extractInstallmentFromDesc(desc);
  if (parsed && parsed.total > 1 && parsed.current > 1) return true;
  return false;
}

function normalizeDesc(desc: string): string {
  return desc.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim().slice(0, 30);
}

function isSimilar(existing: { description: string; amount: string; payment_date: string }, desc: string, amount: number, date: string): boolean {
  const existingDesc = normalizeDesc(existing.description);
  const newDesc = normalizeDesc(desc);
  const minLen = Math.min(existingDesc.length, newDesc.length, 20);
  if (minLen === 0) return false;
  let matches = 0;
  for (let i = 0; i < minLen; i++) { if (existingDesc[i] === newDesc[i]) matches++; }
  if (matches / minLen < 0.6) return false;
  const existingAmount = Math.abs(Number(existing.amount));
  const diff = Math.abs(existingAmount - amount);
  const pct = existingAmount > 0 ? diff / existingAmount : 1;
  if (pct > 0.05 && diff > 1.0) return false;
  const d1 = new Date(existing.payment_date).getTime();
  const d2 = new Date(date).getTime();
  return Math.abs(d1 - d2) / (1000 * 60 * 60 * 24) <= 2;
}

export interface PluggyPreviewRow {
  pluggyId: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  paymentDate: string;
  isPaid: boolean;
  isCredit: boolean;
  cardId: string | null;
  accountId: string;
  installmentNumber: number | null;
  totalInstallments: number | null;
  installmentGroupId: string | null;
  category: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: getCorsHeaders(req) });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401, req);

  const anonClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) return json({ error: "Unauthorized" }, 401, req);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const body = await req.json();
  const { pluggyItemId, localAccountId } = body as { pluggyItemId: string; localAccountId: string };
  if (!pluggyItemId || !localAccountId) return json({ error: "pluggyItemId and localAccountId required" }, 400, req);

  const { data: accountCheck } = await supabase
    .from("bank_accounts").select("id").eq("id", localAccountId).eq("user_id", user.id).maybeSingle();
  if (!accountCheck) return json({ error: "Account not found or access denied" }, 403, req);

  let apiKey: string;
  try { apiKey = await getApiKey(); } catch (e) { return json({ error: String(e) }, 502, req); }

  const accListRes = await fetch(`${PLUGGY_API}/accounts?itemId=${pluggyItemId}`, { headers: { "X-API-KEY": apiKey } });
  if (!accListRes.ok) return json({ error: "Failed to list Pluggy accounts" }, 502, req);
  const allAccounts: Array<Record<string, unknown>> = (await accListRes.json()).results ?? [];

  const { data: creditCards } = await supabase
    .from("credit_cards").select("id")
    .eq("bank_account_id", localAccountId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1);
  const linkedCardId = creditCards?.[0]?.id ?? null;

  const { data: lastTx } = await supabase
    .from("transactions").select("payment_date")
    .eq("user_id", user.id).eq("account_id", localAccountId).like("notes", "pluggy:%")
    .order("payment_date", { ascending: false }).limit(1).maybeSingle();

  const fromDate = lastTx?.payment_date
    ? (() => { const d = new Date(lastTx.payment_date); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })()
    : (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split("T")[0]; })();
  const toDate = new Date().toISOString().split("T")[0];

  if (fromDate > toDate) return json({ rows: [], upToDate: true }, 200, req);

  const { data: existingTxs } = await supabase
    .from("transactions").select("description, amount, payment_date")
    .eq("user_id", user.id).eq("account_id", localAccountId)
    .gte("payment_date", (() => { const d = new Date(fromDate); d.setDate(d.getDate() - 2); return d.toISOString().split("T")[0]; })())
    .lte("payment_date", (() => { const d = new Date(toDate); d.setDate(d.getDate() + 2); return d.toISOString().split("T")[0]; })());
  const localTxsForDedup: Array<{ description: string; amount: string; payment_date: string }> = existingTxs ?? [];

  const rows: PluggyPreviewRow[] = [];

  for (const pluggyAcc of allAccounts) {
    const pluggyAccountId = pluggyAcc.id as string;
    const isCredit = pluggyAcc.type === "CREDIT";
    if (isCredit && !linkedCardId) continue;

    const txRes = await fetch(
      `${PLUGGY_API}/transactions?accountId=${pluggyAccountId}&from=${fromDate}&to=${toDate}&pageSize=500`,
      { headers: { "X-API-KEY": apiKey } }
    );
    if (!txRes.ok) continue;
    const pluggyTransactions: Array<Record<string, unknown>> = (await txRes.json()).results ?? [];

    for (const tx of pluggyTransactions) {
      if (isPaymentTx(tx)) continue;
      if (shouldSkipInstallment(tx)) continue;

      const externalRef = `pluggy:${tx.id}`;
      const { data: existingByRef } = await supabase
        .from("transactions").select("id")
        .eq("user_id", user.id).eq("notes", externalRef).maybeSingle();
      if (existingByRef) continue;

      const amount = resolveAmount(tx);
      const paymentDate = typeof tx.date === "string" ? tx.date.split("T")[0] : toDate;
      const description = (tx.description as string) ?? ((tx.merchant as Record<string, unknown>)?.name as string) ?? "Transacao importada";

      if (localTxsForDedup.some((e) => isSimilar(e, description, amount, paymentDate))) continue;

      const paymentData = tx.paymentData as Record<string, unknown> | null;
      let totalInstallments = Number(paymentData?.totalInstallments ?? 1);
      let installmentNumber: number | null = null;
      let installmentGroupId: string | null = null;
      if (totalInstallments <= 1) {
        const parsed = extractInstallmentFromDesc(description);
        if (parsed && parsed.total > 1) totalInstallments = parsed.total;
      }
      if (totalInstallments > 1 && isCredit && linkedCardId) {
        installmentNumber = 1;
        installmentGroupId = `pluggy-group:${description}:${amount}:${linkedCardId}`;
      }

      const type: "income" | "expense" = isCredit ? "expense" : (tx.type === "CREDIT" ? "income" : "expense");

      rows.push({
        pluggyId: externalRef,
        description,
        amount,
        type,
        paymentDate,
        isPaid: (tx.status as string) !== "PENDING",
        isCredit,
        cardId: isCredit ? linkedCardId : null,
        accountId: localAccountId,
        installmentNumber,
        totalInstallments: totalInstallments > 1 ? totalInstallments : null,
        installmentGroupId,
        category: (tx.category as string) ?? null,
      });

      localTxsForDedup.push({ description, amount: String(amount), payment_date: paymentDate });
    }
  }

  return json({ rows, upToDate: false, fromDate, toDate }, 200, req);
});
