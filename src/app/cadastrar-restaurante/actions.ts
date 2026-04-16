"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/prisma";

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

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
    await db.restaurant.create({
      data: {
        name,
        slug,
        description,
        avatarImageUrl,
        coverImageUrl,
      },
    });
  } catch (err) {
    console.error("[createRestaurant]", err);
    return { error: "Erro ao salvar no banco de dados. Tente novamente." };
  }

  revalidatePath("/restaurantes-cadastrados");
  redirect("/restaurantes-cadastrados");
}