"use server";

import { headers } from "next/headers";
import Stripe from "stripe";

import { db } from "@/lib/prisma";

import { CartProduct } from "../contexts/cart";
import { removeCpfPunctuation } from "../helpers/cpf";

interface CreateStripeCheckoutInput {
  orderId: string;
  products: CartProduct[];
  slug: string;
  cpf: string;
}

export const createStripeCheckout = async ({
  orderId,
  products,
  slug,
  cpf,
}: CreateStripeCheckoutInput) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing Stripe secret key");
  }
  const origin = (await headers()).get("origin") as string;
  const productsWithPrices = await db.product.findMany({
    where: {
      id: {
        in: products.map((product) => product.id),
      },
    },
  });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
  const cleanCpf = removeCpfPunctuation(cpf);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${origin}/${slug}/orders?cpf=${cleanCpf}`,
    cancel_url: `${origin}/${slug}/orders?cpf=${cleanCpf}`,
    metadata: {
      orderId,
    },
    line_items: products.map((product) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: product.name,
          images: [product.imageUrl],
        },
        unit_amount:
          productsWithPrices.find((p) => p.id === product.id)!.price * 100,
      },
      quantity: product.quantity,
    })),
  });
  return { sessionId: session.id };
};
