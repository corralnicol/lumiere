type ProductImageInput = {
  id: string;
  brand: string;
  name: string;
  category: string | null;
  imageUrl?: string | null;
};

export function normalizeImageUrl(imageUrl?: string | null) {
  if (!imageUrl || imageUrl.trim() === "") {
    return "";
  }

  const cleanUrl = imageUrl.trim();

  try {
    return new URL(cleanUrl).href;
  } catch {
    return encodeURI(cleanUrl);
  }
}

export function getFallbackImageByCategory(category: string | null) {
  if (!category) {
    return "/images/categories/foundation.png";
  }
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes("foundation")) {
    return "/images/categories/foundation.png";
  }

  if (normalizedCategory.includes("concealer")) {
    return "/images/categories/concealer.png";
  }

  if (normalizedCategory.includes("blush")) {
    return "/images/categories/blush.png";
  }

  if (normalizedCategory.includes("lip")) {
    return "/images/categories/lip.png";
  }

  if (normalizedCategory.includes("contour")) {
    return "/images/categories/contour.png";
  }

  if (normalizedCategory.includes("eyelash")) {
    return "/images/categories/eyelash.png";
  }

  if (normalizedCategory.includes("eyeliner")) {
    return "/images/categories/eyeliner.png";
  }

  if (normalizedCategory.includes("eyeshadow")) {
    return "/images/categories/eyeshadow.png";
  }

  return "/images/categories/foundation.png";
}

export function getProductImageSrc(product: ProductImageInput) {
  const normalizedImageUrl = normalizeImageUrl(product.imageUrl);

  if (normalizedImageUrl) {
    return normalizedImageUrl;
  }

  return getFallbackImageByCategory(product.category);
}
