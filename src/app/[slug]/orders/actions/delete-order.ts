"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";

export const deleteOrder = async (orderId: number, slug: string) => {
  try {
    await db.order.delete({
      where: {
        id: orderId,
      },
    });

    revalidatePath(`/${slug}/orders`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao deletar pedido",
    };
  }
};
