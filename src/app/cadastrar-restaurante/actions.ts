"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";

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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

const PLACEHOLDER_AVATAR =
  "https://placehold.co/200x200/orange/white?text=Logo";
const PLACEHOLDER_COVER =
  "https://placehold.co/1200x400/gray/white?text=Capa";

export async function createRestaurant(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
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

  if (!name || name.length < 2)
    fieldErrors.name = "Nome deve ter pelo menos 2 caracteres.";

  if (!description || description.length < 10)
    fieldErrors.description = "Descrição deve ter pelo menos 10 caracteres.";

  if (avatarImageUrlRaw && !isValidUrl(avatarImageUrlRaw))
    fieldErrors.avatarImageUrl = "URL da logo inválida. Use http:// ou https://";

  if (coverImageUrlRaw && !isValidUrl(coverImageUrlRaw))
    fieldErrors.coverImageUrl = "URL da capa inválida. Use http:// ou https://";

  if (categories.length === 0) {
    fieldErrors.categories = "Adicione pelo menos uma categoria.";
  } else {
    categories.forEach((cat, index) => {
      if (!cat.name.trim()) {
        fieldErrors[`category-${index}`] = "Nome da categoria é obrigatório.";
      }
    });
  }

  if (products.length === 0) {
    fieldErrors.products = "Adicione pelo menos um produto.";
  } else {
    products.forEach((prod, index) => {
      if (!prod.name.trim()) fieldErrors[`product-name-${index}`] = "Obrigatório.";
      if (prod.price <= 0) fieldErrors[`product-price-${index}`] = "Inválido.";
      if (!prod.categoryTempId) fieldErrors[`product-category-${index}`] = "Obrigatório.";
    });
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

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
  const avatarImageUrl =
    avatarImageUrlRaw && isValidUrl(avatarImageUrlRaw)
      ? avatarImageUrlRaw
      : PLACEHOLDER_AVATAR;

  const coverImageUrl =
    coverImageUrlRaw && isValidUrl(coverImageUrlRaw)
      ? coverImageUrlRaw
      : PLACEHOLDER_COVER;

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
  } catch (err) {
    console.error("[createRestaurant]", err);
    return { error: "Erro ao salvar no banco de dados. Tente novamente." };
  }

  revalidatePath("/restaurantes-cadastrados");
  redirect("/restaurantes-cadastrados");
}