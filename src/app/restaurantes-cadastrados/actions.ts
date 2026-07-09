"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";

type DeleteRestaurantResult = {
  success: boolean;
  error?: string;
};

export async function deleteRestaurant(
  restaurantId: string,
): Promise<DeleteRestaurantResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: "Você precisa estar autenticado para excluir um restaurante.",
    };
  }

  try {
    await db.restaurant.delete({
      where: {
        id: restaurantId,
      },
    });

    revalidatePath("/restaurantes-cadastrados");

    return { success: true };
  } catch (error) {
    console.error("[deleteRestaurant]", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao excluir restaurante.",
    };
  }
}