"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";
import {
  generateSlug,
  isValidUrl,
  PLACEHOLDER_IMAGES,
  validateCategoryName,
  validateImageUrl,
  validateProductName,
  validateProductPrice,
  validateRestaurantDescription,
  validateRestaurantName,
} from "@/lib/validators";

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

interface CategoryData {
  name: string;
  tempId: string;
}

interface ProductData {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  categoryTempId: string;
}

export async function createRestaurant(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  // Verificar autenticação
  const { userId } = await auth();
  if (!userId) {
    return { error: "Você precisa estar autenticado para criar um restaurante." };
  }

  const name = (formData.get("name") as string)?.trim();
  const slugRaw = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const avatarImageUrlRaw = (formData.get("avatarImageUrl") as string)?.trim();
  const coverImageUrlRaw = (formData.get("coverImageUrl") as string)?.trim();

  const categoriesJson = formData.get("categories") as string;
  const productsJson = formData.get("products") as string;

  let categories: CategoryData[] = [];
  let products: ProductData[] = [];

  try {
    categories = JSON.parse(categoriesJson || "[]");
    products = JSON.parse(productsJson || "[]");
  } catch (e) {
    console.error("Error parsing categories or products", e);
  }

  // ----- Field validation -----
  const fieldErrors: ActionState["fieldErrors"] = {};

  // Validar nome
  const nameError = validateRestaurantName(name);
  if (nameError) fieldErrors.name = nameError;

  // Validar descrição
  const descError = validateRestaurantDescription(description);
  if (descError) fieldErrors.description = descError;

  // Validar URLs de imagem
  const avatarError = validateImageUrl(avatarImageUrlRaw, "URL da logo");
  if (avatarError) fieldErrors.avatarImageUrl = avatarError;

  const coverError = validateImageUrl(coverImageUrlRaw, "URL da capa");
  if (coverError) fieldErrors.coverImageUrl = coverError;

  // Validar categorias
  if (categories.length === 0) {
    fieldErrors.categories = "Adicione pelo menos uma categoria.";
  } else {
    categories.forEach((cat, index) => {
      const catError = validateCategoryName(cat.name);
      if (catError) {
        fieldErrors[`category-${index}`] = catError;
      }
    });
  }

  // Validar produtos
  if (products.length === 0) {
    fieldErrors.products = "Adicione pelo menos um produto.";
  } else {
    products.forEach((prod, index) => {
      const prodNameError = validateProductName(prod.name);
      if (prodNameError) fieldErrors[`product-name-${index}`] = prodNameError;

      const priceError = validateProductPrice(prod.price);
      if (priceError) fieldErrors[`product-price-${index}`] = priceError;

      if (!prod.categoryTempId) {
        fieldErrors[`product-category-${index}`] = "Categoria é obrigatória.";
      }
    });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // ----- Slug handling -----
  const slug = slugRaw || generateSlug(name);

  const slugConflict = await db.restaurant.findUnique({ where: { slug } });
  if (slugConflict)
    return {
      fieldErrors: {
        slug: `A URL "${slug}" já está em uso. Escolha outra.`,
      },
    };

  // ----- Image URLs (fallback to placeholders) -----
  const avatarImageUrl = isValidUrl(avatarImageUrlRaw)
    ? avatarImageUrlRaw
    : PLACEHOLDER_IMAGES.AVATAR;

  const coverImageUrl = isValidUrl(coverImageUrlRaw)
    ? coverImageUrlRaw
    : PLACEHOLDER_IMAGES.COVER;

  // ----- Persist -----
  try {
    await db.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name,
          slug,
          description,
          avatarImageUrl,
          coverImageUrl,
        },
      });

      // Create categories and map tempIds to real IDs
      const categoryMap = new Map<string, string>();
      for (const cat of categories) {
        const createdCategory = await tx.menuCategory.create({
          data: {
            name: cat.name,
            restaurantId: restaurant.id,
          },
        });
        categoryMap.set(cat.tempId, createdCategory.id);
      }

      // Create products
      for (const prod of products) {
        const categoryId = categoryMap.get(prod.categoryTempId);
        if (!categoryId) continue;

        await tx.product.create({
          data: {
            name: prod.name,
            description: prod.description || "",
            price: prod.price,
            imageUrl: prod.imageUrl || "https://placehold.co/400x400?text=Produto",
            restaurantId: restaurant.id,
            menuCategoryId: categoryId,
          },
        });
      }
    });

    revalidatePath("/restaurantes-cadastrados");
    redirect("/restaurantes-cadastrados");
  } catch (err) {
    console.error("[createRestaurant]", err);
    return { error: "Erro ao salvar no banco de dados. Tente novamente." };
  }
}