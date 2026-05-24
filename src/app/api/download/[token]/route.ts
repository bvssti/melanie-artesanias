import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Endpoint público (lo abre el cliente desde el email).
// Seguridad: download_token es un UUID v4 único por orden — no adivinable.
// La descarga sigue requiriendo que la orden esté en status='paid'.
//
// Este route NO debe ser cacheado: lookups y URL firmadas son por-request.
export const dynamic = "force-dynamic";

// Validador UUID v4 conservador.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hora

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!UUID_RE.test(token)) {
    return new NextResponse("Token inválido", { status: 400 });
  }

  const service = createServiceClient();

  // 1. Buscar la orden por token
  const { data: order, error: orderErr } = await service
    .from("orders")
    .select("id, status, download_count, order_number")
    .eq("download_token", token)
    .maybeSingle();

  if (orderErr) {
    console.error("[download] error consultando orden:", orderErr);
    return new NextResponse("Error interno", { status: 500 });
  }

  if (!order) {
    return new NextResponse("Pedido no encontrado", { status: 404 });
  }

  if (order.status !== "paid") {
    return new NextResponse(
      "Tu pedido aún no está pagado. Vuelve cuando el pago haya sido confirmado.",
      { status: 403 }
    );
  }

  // 2. Buscar productos digitales de esta orden y sus paths de PDF
  const { data: items, error: itemsErr } = await service
    .from("order_items")
    .select("product_id, product_name")
    .eq("order_id", order.id)
    .eq("product_type", "digital");

  if (itemsErr || !items || items.length === 0) {
    return new NextResponse(
      "Esta orden no tiene productos digitales para descargar.",
      { status: 404 }
    );
  }

  const productIds = items.map((i) => i.product_id);
  const { data: products } = await service
    .from("products")
    .select("id, name, pdf_url")
    .in("id", productIds);

  const pdfPaths = (products ?? [])
    .map((p) => p.pdf_url)
    .filter((p): p is string => !!p && p.trim().length > 0);

  if (pdfPaths.length === 0) {
    console.warn(
      `[download] orden ${order.order_number} no tiene PDFs cargados`
    );
    return new NextResponse(
      "Tu pedido tiene productos digitales pero los PDFs aún no están listos. Escríbenos.",
      { status: 404 }
    );
  }

  // 3. Generar URL firmada para el primer (o único) PDF
  // Limitación: si la orden tiene 2+ PDFs distintos, este endpoint solo
  // redirige al primero. Mejora futura: servir un index HTML con todos.
  const targetPath = pdfPaths[0];
  const { data: signed, error: signErr } = await service.storage
    .from("product-pdfs")
    .createSignedUrl(targetPath, SIGNED_URL_TTL_SECONDS);

  if (signErr || !signed?.signedUrl) {
    console.error("[download] error generando signed URL:", signErr);
    return new NextResponse("No se pudo generar el link de descarga", {
      status: 500,
    });
  }

  // 4. Incrementar contador de descargas (best-effort, no bloquea)
  await service
    .from("orders")
    .update({ download_count: (order.download_count ?? 0) + 1 })
    .eq("id", order.id);

  // 5. Redirigir al signed URL
  return NextResponse.redirect(signed.signedUrl, 302);
}
