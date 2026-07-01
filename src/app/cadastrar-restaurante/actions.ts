"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/prisma";
import {
  generateSlug,
  isValidUrl,
  PLACEHOLDER_IMAGES,
  validateCategoryName,
  validateProductName,
  validateProductPrice,
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

const restaurantFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres." })
    .max(100, { message: "Nome não pode exceder 100 caracteres." }),
  slug: z
    .string()
    .trim()
    .min(2, {
      message: "A URL personalizada deve ter pelo menos 2 caracteres.",
    })
    .max(50, {
      message: "A URL personalizada não pode exceder 50 caracteres.",
    }),
  description: z
    .string()
    .trim()
    .min(10, { message: "Descrição deve ter pelo menos 10 caracteres." })
    .max(500, { message: "Descrição não pode exceder 500 caracteres." }),
  avatarImageUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidUrl(value), {
      message: "URL da logo inválida.",
    }),
  coverImageUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidUrl(value), {
      message: "URL da capa inválida.",
    }),
});

export async function createRestaurant(
  _prevState: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  // Verificar autenticação
  const { userId } = await auth();
  if (!userId) {
    return {
      error: "Você precisa estar autenticado para criar um restaurante.",
    };
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

  const parsedRestaurantFields = restaurantFormSchema.safeParse({
    name,
    slug: slugRaw || generateSlug(name || ""),
    description,
    avatarImageUrl: avatarImageUrlRaw || "",
    coverImageUrl: coverImageUrlRaw || "",
  });

  if (!parsedRestaurantFields.success) {
    const flattened = parsedRestaurantFields.error.flatten().fieldErrors;
    if (flattened.name?.[0]) fieldErrors.name = flattened.name[0];
    if (flattened.slug?.[0]) fieldErrors.slug = flattened.slug[0];
    if (flattened.description?.[0])
      fieldErrors.description = flattened.description[0];
    if (flattened.avatarImageUrl?.[0])
      fieldErrors.avatarImageUrl = flattened.avatarImageUrl[0];
    if (flattened.coverImageUrl?.[0])
      fieldErrors.coverImageUrl = flattened.coverImageUrl[0];
  }

  // Validar categorias (opcional no cadastro inicial)
  if (categories.length > 0) {
    categories.forEach((cat, index) => {
      const catError = validateCategoryName(cat.name);
      if (catError) {
        fieldErrors[`category-${index}`] = catError;
      }
    });
  }

  // Validar produtos (opcional no cadastro inicial)
  if (products.length > 0) {
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
  const slug = slugRaw || generateSlug(name || "");

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
            imageUrl:
              prod.imageUrl || "https://placehold.co/400x400?text=Produto",
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
