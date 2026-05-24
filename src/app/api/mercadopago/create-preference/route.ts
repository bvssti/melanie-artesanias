import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { createPreference } from "@/lib/mercadopago";

// Schema de validación del payload del checkout
const checkoutSchema = z.object({
  customer: z.object({
    nombre: z.string().min(2),
    email: z.string().email(),
    telefono: z.string().min(6),
    rut: z.string().optional(),
    direccion: z.string().optional(),
    ciudad: z.string().optional(),
    region: z.string().optional(),
    notas: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos del checkout inválidos", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { customer, items } = parsed.data;
  const supabase = createServiceClient();

  // 1. Validar productos contra la BD (precio + stock)
  const productIds = items.map((i) => i.id);
  const { data: dbProducts, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, price, stock, type, published")
    .in("id", productIds);

  if (productsError || !dbProducts) {
    return NextResponse.json(
      { error: "No se pudieron validar los productos" },
      { status: 500 }
    );
  }

  for (const item of items) {
    const product = dbProducts.find((p) => p.id === item.id);
    if (!product || !product.published) {
      return NextResponse.json(
        { error: `Producto ${item.name} no está disponible` },
        { status: 400 }
      );
    }
    if (product.price !== item.price) {
      return NextResponse.json(
        { error: `El precio de ${product.name} ha cambiado, refresca el carrito` },
        { status: 409 }
      );
    }
    if (product.type === "physical" && product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Sin stock suficiente de ${product.name}` },
        { status: 409 }
      );
    }
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  // 2. Crear la orden en estado pending
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customer.nombre,
      customer_email: customer.email,
      customer_phone: customer.telefono,
      customer_rut: customer.rut || null,
      shipping_address: customer.direccion || null,
      shipping_city: customer.ciudad || null,
      shipping_region: customer.region || null,
      notes: customer.notas || null,
      subtotal,
      shipping_cost: 0,
      total: subtotal,
      status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "No se pudo crear la orden" },
      { status: 500 }
    );
  }

  // 3. Insertar order_items
  const orderItems = items.map((i) => {
    const product = dbProducts.find((p) => p.id === i.id)!;
    return {
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      product_type: product.type,
      unit_price: i.price,
      quantity: i.quantity,
      total: i.price * i.quantity,
    };
  });

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return NextResponse.json(
      { error: "No se pudieron registrar los items" },
      { status: 500 }
    );
  }

  // 4. Crear preferencia en Mercado Pago
  try {
    const preference = await createPreference({
      orderId: order.id,
      items: items.map((i) => ({
        id: i.id,
        title: i.name,
        quantity: i.quantity,
        unit_price: i.price,
        currency_id: "CLP",
      })),
      payer: {
        name: customer.nombre,
        email: customer.email,
        phone: { number: customer.telefono },
      },
      metadata: {
        order_id: order.id,
        order_number: String(order.order_number),
      },
    });

    // 5. Guardar el ID de preferencia
    await supabase
      .from("orders")
      .update({ mp_preference_id: preference.id })
      .eq("id", order.id);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      preferenceId: preference.id,
      initPoint: preference.initPoint,
      sandboxInitPoint: preference.sandboxInitPoint,
    });
  } catch (e) {
    // Logging detallado para diagnosticar errores del SDK de Mercado Pago.
    // El SDK suele tirar un Error con la respuesta de la API anidada en
    // `cause` o en propiedades como `status`/`message`. Volcamos todo lo
    // que podamos para que aparezca legible en Vercel logs.
    const err = e as {
      name?: string;
      message?: string;
      status?: number;
      cause?: unknown;
      stack?: string;
    };

    console.error("[MP create-preference] ❌ falló createPreference");
    console.error("  order:", {
      id: order.id,
      order_number: order.order_number,
      total: order.total,
      itemsCount: items.length,
    });
    console.error("  error.name:", err.name);
    console.error("  error.message:", err.message);
    console.error("  error.status:", err.status);
    console.error("  error.cause:", err.cause);
    // JSON.stringify con replacer captura props no-enumerables como las que
    // mete el SDK (response, config, etc.).
    try {
      console.error(
        "  error (full):",
        JSON.stringify(
          e,
          Object.getOwnPropertyNames(e as object),
          2
        )
      );
    } catch {
      console.error("  error (raw):", e);
    }
    if (err.stack) console.error("  stack:", err.stack);

    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);
    return NextResponse.json(
      {
        error: "No se pudo iniciar el pago",
        // Solo expongo detalles al cliente fuera de producción para no
        // filtrar tokens/PII si el mensaje de MP los incluye.
        ...(process.env.NODE_ENV !== "production" && {
          detail: err.message,
          status: err.status,
        }),
      },
      { status: 502 }
    );
  }
}
