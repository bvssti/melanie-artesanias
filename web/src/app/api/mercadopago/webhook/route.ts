import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchPayment } from "@/lib/mercadopago";

// Webhook de Mercado Pago — recibe notificaciones de cambios de pago.
// Doc: https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
//
// MP envía un POST con { type, data: { id } }.
// El secret se configura en el panel de webhooks de MP y se valida
// con la cabecera x-signature (formato: ts=..., v1=...).
export async function POST(request: Request) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  const rawBody = await request.text();

  // Validar firma (solo si tenemos secret + cabecera)
  if (secret && xSignature && dataId && xRequestId) {
    const parts = Object.fromEntries(
      xSignature.split(",").map((p) => p.trim().split("=") as [string, string])
    );
    const ts = parts.ts;
    const hash = parts.v1;
    if (!ts || !hash) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");
    if (
      expected.length !== hash.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash))
    ) {
      return NextResponse.json(
        { error: "Firma no coincide" },
        { status: 401 }
      );
    }
  }

  let payload: { type?: string; data?: { id?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (payload.type !== "payment" || !payload.data?.id) {
    // Otros tipos de notificación los ignoramos por ahora
    return NextResponse.json({ ok: true });
  }

  const paymentId = payload.data.id;

  try {
    const payment = await fetchPayment(paymentId);
    const orderId = payment.external_reference;
    const mpStatus = payment.status;

    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createServiceClient();

    // Mapeo de estados de MP → estados internos
    const statusMap: Record<string, string> = {
      approved: "paid",
      pending: "pending",
      in_process: "pending",
      authorized: "pending",
      rejected: "cancelled",
      cancelled: "cancelled",
      refunded: "refunded",
      charged_back: "refunded",
    };

    const newStatus = mpStatus ? statusMap[mpStatus] ?? "pending" : "pending";

    await supabase
      .from("orders")
      .update({
        mp_payment_id: String(paymentId),
        mp_status: mpStatus,
        status: newStatus,
      })
      .eq("id", orderId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Webhook MP error:", e);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}

// MP también hace GET para health-checks
export async function GET() {
  return NextResponse.json({ ok: true });
}
