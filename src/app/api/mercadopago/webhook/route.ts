import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchPayment } from "@/lib/mercadopago";

// ------------------------------------------------------------
// Email de entrega digital
// ------------------------------------------------------------
// Solo se manda cuando la orden pasa a `paid` Y tiene al menos un item
// con product_type = 'digital'. Idempotente: si ya estaba paid (reintento
// de webhook), no se reenvía.
async function sendDigitalDeliveryEmail(params: {
  to: string;
  customerName: string;
  downloadToken: string;
  orderNumber: number;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[webhook] RESEND_API_KEY no configurada — no se envía email digital"
    );
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL ??
    "Artesanías Melanie <onboarding@resend.dev>";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://melanie-artesanias.vercel.app";
  const link = `${baseUrl}/api/download/${params.downloadToken}`;

  const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background:#fdfaf6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2d2a26;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#fdfaf6;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:24px;padding:40px;border:1px solid #ece6df;">
            <tr>
              <td>
                <h1 style="margin:0 0 8px;font-size:32px;line-height:1.1;color:#2d2a26;">¡Tu patrón está listo, ${escapeHtml(params.customerName.split(" ")[0] || "Hola")}! 🎉</h1>
                <p style="margin:0 0 24px;color:#6d655c;font-size:15px;line-height:1.6;">
                  Gracias por tu compra. Tu pedido <strong>#${params.orderNumber}</strong> ya está pagado y puedes descargar tu patrón digital con el botón de abajo.
                </p>
                <p style="margin:0 0 32px;">
                  <a href="${link}" style="display:inline-block;background:#c98a6b;color:#ffffff;text-decoration:none;font-weight:600;padding:14px 28px;border-radius:999px;font-size:15px;">
                    Descargar mi patrón
                  </a>
                </p>
                <p style="margin:0 0 8px;color:#6d655c;font-size:13px;line-height:1.6;">
                  Este link es personal y único para tu pedido. <strong>Expira en 24 horas</strong>, así que guarda el PDF en tu computador apenas lo descargues.
                </p>
                <p style="margin:0;color:#aaa39a;font-size:12px;line-height:1.6;">
                  Si el botón no funciona, copia este link en tu navegador:<br/>
                  <span style="word-break:break-all;color:#6d655c;">${link}</span>
                </p>
                <hr style="border:none;border-top:1px solid #ece6df;margin:32px 0;" />
                <p style="margin:0;color:#aaa39a;font-size:12px;line-height:1.6;">
                  ¿Algún problema? Respóndeme este correo y lo resolvemos juntas.<br/>
                  Con cariño,<br/>
                  Melanie · Artesanías Melanie
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: "Tu patrón digital está listo 🎉",
    html,
  });

  if (error) {
    console.error("[webhook] Resend error:", error);
  } else {
    console.log(
      `[webhook] email digital enviado a ${params.to} (orden #${params.orderNumber})`
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

    // Leemos la orden ANTES del update para detectar la transición a 'paid'
    // y evitar reenvíos de email si MP repite el webhook.
    const { data: prev } = await supabase
      .from("orders")
      .select(
        "id, status, customer_email, customer_name, download_token, order_number"
      )
      .eq("id", orderId)
      .maybeSingle();

    if (!prev) {
      console.warn(`[webhook] orden ${orderId} no encontrada`);
      return NextResponse.json({ ok: true });
    }

    await supabase
      .from("orders")
      .update({
        mp_payment_id: String(paymentId),
        mp_status: mpStatus,
        status: newStatus,
      })
      .eq("id", orderId);

    // Transición a 'paid' por primera vez → posible email digital.
    if (newStatus === "paid" && prev.status !== "paid") {
      const { data: digitalItems } = await supabase
        .from("order_items")
        .select("id")
        .eq("order_id", orderId)
        .eq("product_type", "digital")
        .limit(1);

      const hasDigital = !!digitalItems && digitalItems.length > 0;
      if (hasDigital && prev.download_token && prev.customer_email) {
        // No bloqueamos la respuesta al webhook si el email falla — lo logueamos.
        try {
          await sendDigitalDeliveryEmail({
            to: prev.customer_email,
            customerName: prev.customer_name ?? "",
            downloadToken: prev.download_token,
            orderNumber: prev.order_number,
          });
        } catch (emailErr) {
          console.error("[webhook] sendDigitalDeliveryEmail falló:", emailErr);
        }
      }
    }

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
