// Cliente de Mercado Pago (server-only).
// Doc: https://www.mercadopago.cl/developers/es/docs
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

let cached: MercadoPagoConfig | null = null;

function getClient() {
  if (cached) return cached;
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "MP_ACCESS_TOKEN no está configurado. Agrégalo a .env.local."
    );
  }
  cached = new MercadoPagoConfig({
    accessToken: token,
    options: { timeout: 8000 },
  });
  return cached;
}

export interface PreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: "CLP" | "ARS" | "PEN" | "MXN" | "COP";
  picture_url?: string;
  category_id?: string;
  description?: string;
}

export interface CreatePreferenceInput {
  orderId: string;
  items: PreferenceItem[];
  payer: {
    name?: string;
    email: string;
    phone?: { number: string };
  };
  shipping?: {
    cost: number;
    mode?: "not_specified";
  };
  metadata?: Record<string, string | number>;
}

export async function createPreference(input: CreatePreferenceInput) {
  const client = getClient();
  const preference = new Preference(client);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const response = await preference.create({
    body: {
      items: input.items.map((i) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unit_price,
        currency_id: i.currency_id ?? "CLP",
        picture_url: i.picture_url,
        description: i.description,
      })),
      payer: {
        name: input.payer.name,
        email: input.payer.email,
        phone: input.payer.phone,
      },
      shipments: input.shipping
        ? {
            cost: input.shipping.cost,
            mode: input.shipping.mode ?? "not_specified",
          }
        : undefined,
      back_urls: {
        success: `${baseUrl}/pago/exito?order=${input.orderId}`,
        failure: `${baseUrl}/pago/error?order=${input.orderId}`,
        pending: `${baseUrl}/pago/pendiente?order=${input.orderId}`,
      },
      auto_return: "approved",
      external_reference: input.orderId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      metadata: input.metadata,
      statement_descriptor: "Artesanias Melanie",
    },
  });

  return {
    id: response.id!,
    initPoint: response.init_point!,
    sandboxInitPoint: response.sandbox_init_point!,
  };
}

export async function fetchPayment(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
