"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";

// --- Categories ---

export async function createCategory(restaurantId: string, name: string) {
  await db.menuCategory.create({
    data: {
      name,
      restaurantId,
    },
  });
  revalidatePath(`/restaurantes-cadastrados/${restaurantId}/menu`);
}

export async function updateCategory(id: string, restaurantId: string, name: string) {
  await db.menuCategory.update({
    where: { id },
    data: { name },
  });
  revalidatePath(`/restaurantes-cadastrados/${restaurantId}/menu`);
}

export async function deleteCategory(id: string, restaurantId: string) {
  await db.menuCategory.delete({
    where: { id },
  });
  revalidatePath(`/restaurantes-cadastrados/${restaurantId}/menu`);
}

// --- Products ---

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  ingredients: string[];
  restaurantId: string;
  menuCategoryId: string;
}) {
  await db.product.create({
    data,
  });
  revalidatePath(`/restaurantes-cadastrados/${data.restaurantId}/menu`);
}

export async function updateProduct(
  id: string,
  restaurantId: string,
  data: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    ingredients: string[];
    menuCategoryId: string;
  }
) {
  await db.product.update({
    where: { id },
    data,
  });
  revalidatePath(`/restaurantes-cadastrados/${restaurantId}/menu`);
}

export async function deleteProduct(id: string, restaurantId: string) {
  await db.product.delete({
    where: { id },
  });
  revalidatePath(`/restaurantes-cadastrados/${restaurantId}/menu`);
}
