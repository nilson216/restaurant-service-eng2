"use server";

import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus,
  slug: string,
) => {
  try {
    await db.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    revalidatePath(`/${slug}/orders`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar status",
    };
  }
};
