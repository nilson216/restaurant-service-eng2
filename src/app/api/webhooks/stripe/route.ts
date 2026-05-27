import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { formatCurrency } from "@/app/helpers/format-currency";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  console.log("✅ Webhook recebido");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY não configurado");
    throw new Error("Missing Stripe secret key");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("❌ Stripe signature não encontrada");
    return NextResponse.error();
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;
  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET_KEY não configurado");
    throw new Error("Missing Stripe webhook secret key");
  }
  const text = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(text, signature, webhookSecret);
    console.log("✅ Webhook validado:", event.type);
  } catch (err) {
    console.error("❌ Erro ao validar webhook:", err);
    return NextResponse.error();
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const orderId = event.data.object.metadata?.orderId;

      if (!orderId) {
        console.error("❌ OrderId não encontrado na metadata");
        return NextResponse.json({ received: true });
      }

      try {
        // Buscar ordem com todos os detalhes
        const order = await db.order.update({
          where: {
            id: Number(orderId),
          },
          data: {
            status: "PAYMENT_CONFIRMED",
          },
          include: {
            restaurant: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
            orderProducts: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        console.log("✅ Pedido atualizado para PAYMENT_CONFIRMED:", order.id);

        // Enviar email de confirmação
        if (order.customerEmail) {
          const items = order.orderProducts.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: formatCurrency(item.price),
          }));

          await sendOrderConfirmationEmail({
            customerEmail: order.customerEmail,
            customerName: order.customerName,
            orderId: String(order.id),
            totalAmount: formatCurrency(order.total),
            items,
            restaurantName: order.restaurant.name,
          });

          console.log(
            `✅ Email de confirmação enviado para ${order.customerEmail}`,
          );
        } else {
          console.warn(
            "⚠️ Email do cliente não encontrado para pedido",
            order.id,
          );
        }

        revalidatePath(`/${order.restaurant.slug}/menu`);
      } catch (err) {
        console.error("❌ Erro ao processar webhook:", err);
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Erro desconhecido" },
          { status: 500 },
        );
      }
      break;
    }

    case "charge.failed": {
      const orderId = event.data.object.metadata?.orderId;
      if (!orderId) {
        return NextResponse.json({
          received: true,
        });
      }
      try {
        const order = await db.order.update({
          where: {
            id: Number(orderId),
          },
          data: {
            status: "PAYMENT_FAILED",
          },
          include: {
            restaurant: {
              select: {
                slug: true,
              },
            },
          },
        });
        console.log("❌ Pagamento falhou para pedido:", order.id);
        revalidatePath(`/${order.restaurant.slug}/menu`);
      } catch (err) {
        console.error("❌ Erro ao processar charge.failed:", err);
      }
      break;
    }
  }

  return NextResponse.json({
    received: true,
  });
}
