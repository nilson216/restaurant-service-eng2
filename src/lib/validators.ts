/**
 * Validadores e constantes compartilhadas
 * Usado em toda a aplicação para garantir consistência
 */

export const VALIDATION_LIMITS = {
  RESTAURANT_NAME_MIN: 2,
  RESTAURANT_NAME_MAX: 100,
  RESTAURANT_DESC_MIN: 10,
  RESTAURANT_DESC_MAX: 500,
  PRODUCT_NAME_MIN: 2,
  PRODUCT_NAME_MAX: 100,
  PRODUCT_DESC_MIN: 5,
  PRODUCT_DESC_MAX: 500,
  PRODUCT_PRICE_MIN: 0.01,
  PRODUCT_PRICE_MAX: 999999.99,
  SLUG_MAX_LENGTH: 50,
  CATEGORY_NAME_MIN: 2,
  CATEGORY_NAME_MAX: 50,
};

export const PLACEHOLDER_IMAGES = {
  AVATAR: "https://placehold.co/200x200/orange/white?text=Logo",
  COVER: "https://placehold.co/1200x400/gray/white?text=Capa",
};

/**
 * Gera um slug a partir do nome do restaurante
 * @param name - Nome do restaurante
 * @param maxLength - Comprimento máximo do slug (padrão: 50)
 * @returns Slug formatado
 */
export function generateSlug(name: string, maxLength = VALIDATION_LIMITS.SLUG_MAX_LENGTH): string {
  if (!name || name.length === 0) return "";

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .substring(0, maxLength)
    .replace(/-+$/, ""); // Remove hífens finais
}

/**
 * Valida se uma URL é válida
 * @param url - URL a ser validada
 * @returns true se a URL é válida, false caso contrário
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Valida o nome de um restaurante
 * @param name - Nome do restaurante
 * @returns Mensagem de erro ou null se válido
 */
export function validateRestaurantName(name: string | undefined): string | null {
  if (!name || name.trim().length === 0) {
    return "Nome do restaurante é obrigatório.";
  }

  if (name.length < VALIDATION_LIMITS.RESTAURANT_NAME_MIN) {
    return `Nome deve ter pelo menos ${VALIDATION_LIMITS.RESTAURANT_NAME_MIN} caracteres.`;
  }

  if (name.length > VALIDATION_LIMITS.RESTAURANT_NAME_MAX) {
    return `Nome não pode exceder ${VALIDATION_LIMITS.RESTAURANT_NAME_MAX} caracteres.`;
  }

  return null;
}

/**
 * Valida a descrição de um restaurante
 * @param description - Descrição do restaurante
 * @returns Mensagem de erro ou null se válido
 */
export function validateRestaurantDescription(description: string | undefined): string | null {
  if (!description || description.trim().length === 0) {
    return "Descrição é obrigatória.";
  }

  if (description.length < VALIDATION_LIMITS.RESTAURANT_DESC_MIN) {
    return `Descrição deve ter pelo menos ${VALIDATION_LIMITS.RESTAURANT_DESC_MIN} caracteres.`;
  }

  if (description.length > VALIDATION_LIMITS.RESTAURANT_DESC_MAX) {
    return `Descrição não pode exceder ${VALIDATION_LIMITS.RESTAURANT_DESC_MAX} caracteres.`;
  }

  return null;
}

/**
 * Valida a URL de uma imagem (logo ou capa)
 * @param url - URL da imagem
 * @param fieldName - Nome do campo (para mensagem de erro)
 * @returns Mensagem de erro ou null se válido
 */
export function validateImageUrl(url: string | undefined, fieldName: string): string | null {
  if (!url || url.trim().length === 0) {
    return null; // Campo opcional
  }

  if (!isValidUrl(url)) {
    return `${fieldName} inválida. Use http:// ou https://`;
  }

  return null;
}

/**
 * Valida o preço de um produto
 * @param price - Preço do produto
 * @returns Mensagem de erro ou null se válido
 */
export function validateProductPrice(price: number | undefined): string | null {
  if (price === undefined || price === null) {
    return "Preço é obrigatório.";
  }

  const numPrice = typeof price === "string" ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return "Preço deve ser um número válido.";
  }

  if (numPrice < VALIDATION_LIMITS.PRODUCT_PRICE_MIN) {
    return `Preço deve ser maior que R$ ${VALIDATION_LIMITS.PRODUCT_PRICE_MIN.toFixed(2).replace(".", ",")}.`;
  }

  if (numPrice > VALIDATION_LIMITS.PRODUCT_PRICE_MAX) {
    return `Preço não pode exceder R$ ${VALIDATION_LIMITS.PRODUCT_PRICE_MAX.toFixed(2).replace(".", ",")}.`;
  }

  return null;
}

/**
 * Valida o nome de um produto
 * @param name - Nome do produto
 * @returns Mensagem de erro ou null se válido
 */
export function validateProductName(name: string | undefined): string | null {
  if (!name || name.trim().length === 0) {
    return "Nome do produto é obrigatório.";
  }

  if (name.length < VALIDATION_LIMITS.PRODUCT_NAME_MIN) {
    return `Nome deve ter pelo menos ${VALIDATION_LIMITS.PRODUCT_NAME_MIN} caracteres.`;
  }

  if (name.length > VALIDATION_LIMITS.PRODUCT_NAME_MAX) {
    return `Nome não pode exceder ${VALIDATION_LIMITS.PRODUCT_NAME_MAX} caracteres.`;
  }

  return null;
}

/**
 * Valida o nome de uma categoria
 * @param name - Nome da categoria
 * @returns Mensagem de erro ou null se válido
 */
export function validateCategoryName(name: string | undefined): string | null {
  if (!name || name.trim().length === 0) {
    return "Nome da categoria é obrigatório.";
  }

  if (name.length < VALIDATION_LIMITS.CATEGORY_NAME_MIN) {
    return `Nome deve ter pelo menos ${VALIDATION_LIMITS.CATEGORY_NAME_MIN} caracteres.`;
  }

  if (name.length > VALIDATION_LIMITS.CATEGORY_NAME_MAX) {
    return `Nome não pode exceder ${VALIDATION_LIMITS.CATEGORY_NAME_MAX} caracteres.`;
  }

  return null;
}
