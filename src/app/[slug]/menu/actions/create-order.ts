"use server";

import { ConsumptionMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { formatCurrency } from "@/helpers/format-currency";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { db } from "@/lib/prisma";

import { removeCpfPunctuation } from "../helpers/cpf";

interface CreateOrderInput {
  customerName: string;
  customerCpf: string;
  customerEmail: string;
  products: Array<{
    id: string;
    quantity: number;
  }>;
  consumptionMethod: ConsumptionMethod;
  slug: string;
}

export const createOrder = async (input: CreateOrderInput) => {
  const restaurant = await db.restaurant.findUnique({
    where: {
      slug: input.slug,
    },
  });
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }
  const productsWithPrices = await db.product.findMany({
    where: {
      id: {
        in: input.products.map((product) => product.id),
      },
    },
  });
  const productsWithPricesAndQuantities = input.products.map((product) => ({
    productId: product.id,
    quantity: product.quantity,
    price: productsWithPrices.find((p) => p.id === product.id)!.price,
  }));
  const order = await db.order.create({
    data: {
      status: "PENDING",
      customerName: input.customerName,
      customerCpf: removeCpfPunctuation(input.customerCpf),
      customerEmail: input.customerEmail,
      orderProducts: {
        createMany: {
          data: productsWithPricesAndQuantities,
        },
      },
      total: productsWithPricesAndQuantities.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0,
      ),
      consumptionMethod: input.consumptionMethod,
      restaurantId: restaurant.id,
    },
    include: {
      orderProducts: {
        include: {
          product: true,
        },
      },
    },
  });

  // Enviar email de confirmação
  try {
    if (order.customerEmail) {
      const items = order.orderProducts.map((op) => ({
        name: op.product.name,
        quantity: op.quantity,
        price: formatCurrency(op.price),
      }));

      await sendOrderConfirmationEmail({
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        orderId: order.id.toString(),
        totalAmount: formatCurrency(order.total),
        items,
        restaurantName: restaurant.name,
      });
    }
  } catch (err) {
    console.error("Erro ao enviar email de confirmação:", err);
  }

  revalidatePath(`/${input.slug}/menu`);
  return order;
};
