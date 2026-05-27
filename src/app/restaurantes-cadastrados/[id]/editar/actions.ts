"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";
import {
  generateSlug,
  PLACEHOLDER_IMAGES,
  validateImageUrl,
  validateRestaurantDescription,
  validateRestaurantName,
} from "@/lib/validators";

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function updateRestaurant(
  id: string,
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  // Verificar autenticação
  const { userId } = await auth();
  if (!userId) {
    return { error: "Você precisa estar autenticado para editar um restaurante." };
  }

  // Verificar se o restaurante existe e pertence ao usuário
  const restaurant = await db.restaurant.findUnique({
    where: { id },
  });

  if (!restaurant) {
    return { error: "Restaurante não encontrado." };
  }

  // Nota: Por enquanto não há coluna de userId no schema.
  // Esta verificação será implementada após atualizar o schema do Prisma.
  // TODO: Adicionar relação User-Restaurant no schema e ativar esta validação:
  // if (restaurant.userId !== userId) {
  //   return { error: "Você não tem permissão para editar este restaurante." };
  // }

  const name = (formData.get("name") as string)?.trim();
  const slugRaw = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const avatarImageUrlRaw = (formData.get("avatarImageUrl") as string)?.trim();
  const coverImageUrlRaw = (formData.get("coverImageUrl") as string)?.trim();

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

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // ----- Slug handling -----
  const slug = slugRaw || generateSlug(name);

  // Check for slug conflict, but excluding the current restaurant
  const slugConflict = await db.restaurant.findFirst({
    where: {
      slug,
      NOT: {
        id: id,
      },
    },
  });

  if (slugConflict)
    return {
      fieldErrors: {
        slug: `A URL "${slug}" já está em uso por outro restaurante. Escolha outra.`,
      },
    };

  // ----- Image URLs (fallback to placeholders) -----
  const avatarImageUrl = avatarImageUrlRaw
    ? avatarImageUrlRaw
    : PLACEHOLDER_IMAGES.AVATAR;

  const coverImageUrl = coverImageUrlRaw
    ? coverImageUrlRaw
    : PLACEHOLDER_IMAGES.COVER;

  // ----- Persist -----
  try {
    await db.restaurant.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        avatarImageUrl,
        coverImageUrl,
      },
    });
  } catch (err) {
    console.error("[updateRestaurant]", err);
    return { error: "Erro ao salvar no banco de dados. Tente novamente." };
  }

  revalidatePath("/restaurantes-cadastrados");
  redirect("/restaurantes-cadastrados");
}
