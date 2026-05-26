"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { validateCategoryName, validateProductName, validateProductPrice } from "@/lib/validators";

// --- CATEGORY ACTIONS ---

export async function createCategory(restaurantId: string, slug: string, name: string) {
  const nameError = validateCategoryName(name);
  if (nameError) throw new Error(nameError);

  await db.menuCategory.create({
    data: {
      name,
      restaurantId,
    },
  });

  revalidatePath(`/${slug}/menu`);
}

export async function updateCategory(id: string, slug: string, name: string) {
  const nameError = validateCategoryName(name);
  if (nameError) throw new Error(nameError);

  await db.menuCategory.update({
    where: { id },
    data: { name },
  });

  revalidatePath(`/${slug}/menu`);
}

export async function deleteCategory(id: string, slug: string) {
  await db.menuCategory.delete({
    where: { id },
  });

  revalidatePath(`/${slug}/menu`);
}

// --- PRODUCT ACTIONS ---

export async function createProduct(input: {
  restaurantId: string;
  menuCategoryId: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  ingredients: string[];
}) {
  const nameError = validateProductName(input.name);
  if (nameError) throw new Error(nameError);

  const priceError = validateProductPrice(input.price);
  if (priceError) throw new Error(priceError);

  await db.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      imageUrl: input.imageUrl,
      ingredients: input.ingredients,
      restaurantId: input.restaurantId,
      menuCategoryId: input.menuCategoryId,
    },
  });

  revalidatePath(`/${input.slug}/menu`);
}

export async function updateProduct(id: string, slug: string, input: {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  ingredients?: string[];
  menuCategoryId?: string;
}) {
  if (input.name) {
    const nameError = validateProductName(input.name);
    if (nameError) throw new Error(nameError);
  }

  if (input.price !== undefined) {
    const priceError = validateProductPrice(input.price);
    if (priceError) throw new Error(priceError);
  }

  await db.product.update({
    where: { id },
    data: input,
  });

  revalidatePath(`/${slug}/menu`);
}

export async function deleteProduct(id: string, slug: string) {
  await db.product.delete({
    where: { id },
  });

  revalidatePath(`/${slug}/menu`);
}
