import type { SyntheticEvent } from "react";

// Este tipo representa los campos de imagen que pueden tener los productos.
// Algunos productos vienen desde products.json, otros desde Supabase y otros desde arrays locales.
export type ProductImageSource = {
  id?: string | number;
  name?: string;
  title?: string;
  brand?: string;
  category?: string;
  image?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  thumbnail?: string | null;
  images?: string[] | null;
};

// Estas fuentes se bloquean porque generan imágenes aleatorias o no relacionadas con el producto.
const BAD_IMAGE_SOURCES = [
  "picsum.photos",
  "source.unsplash.com",
  "random=",
];

// Estas son imágenes locales de respaldo por categoría.
// Deben existir dentro de la carpeta public/images/categories.
const CATEGORY_FALLBACKS: Record<string, string> = {
  foundation: "images/categories/foundation.png",
  base: "images/categories/foundation.png",
  contour: "images/categories/contour.png",
  blush: "images/categories/blush.png",
  eyelash: "images/categories/eyelash.png",
  eyelashes: "images/categories/eyelash.png",
  lip: "images/categories/lip.png",
  lips: "images/categories/lip.png",
  eyeshadow: "images/categories/eyeshadow.png",
  eyeliner: "images/categories/eyeliner.png",
  eyeliners: "images/categories/eyeliner.png",
  concealer: "images/categories/concealer.png",
  corrector: "images/categories/concealer.png",
  beauty: "images/categories/foundation.png",
  makeup: "images/categories/foundation.png",
};

// Esta imagen se usa cuando no se encuentra una categoría válida.
const DEFAULT_FALLBACK_IMAGE = "images/categories/foundation.png";

// Esta función arma rutas correctas para archivos dentro de public.
// Se usa import.meta.env.BASE_URL para que funcione también cuando el proyecto esté desplegado.
const getPublicPath = (path: string) => {
  const cleanPath = path.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};

// Esta función normaliza textos como "Foundation", "foundation " o "FOUNDATION".
// Así evitamos errores cuando la categoría viene con mayúsculas o espacios.
const normalizeText = (value?: string | null) => {
  return value
    ?.toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Esta función valida si una imagen está vacía o viene de una fuente no confiable.
const isInvalidImage = (imageSrc?: string | null) => {
  if (!imageSrc || imageSrc.trim() === "") {
    return true;
  }

  return BAD_IMAGE_SOURCES.some((badSource) =>
    imageSrc.includes(badSource)
  );
};

// Esta función convierte una imagen relativa o absoluta en una ruta que el navegador pueda usar.
const normalizeImagePath = (imageSrc?: string | null) => {
  if (isInvalidImage(imageSrc)) {
    return "";
  }

  const cleanImageSrc = imageSrc!.trim();

  // Si la imagen viene desde Supabase, Pollinations, Cloudinary u otra URL externa, se deja igual.
  if (
    cleanImageSrc.startsWith("http://") ||
    cleanImageSrc.startsWith("https://") ||
    cleanImageSrc.startsWith("data:") ||
    cleanImageSrc.startsWith("blob:")
  ) {
    return cleanImageSrc;
  }

  // Si la imagen es local, se construye la ruta desde public.
  return getPublicPath(cleanImageSrc);
};

// Esta función obtiene una imagen local de respaldo según la categoría del producto.
export const getCategoryFallbackSrc = (product?: ProductImageSource | null) => {
  const category = normalizeText(product?.category);
  const fallbackByCategory = category ? CATEGORY_FALLBACKS[category] : null;

  if (fallbackByCategory) {
    return getPublicPath(fallbackByCategory);
  }

  return getPublicPath(DEFAULT_FALLBACK_IMAGE);
};

// Esta es la función principal para obtener la imagen real del producto.
// Primero revisa imageUrl, image_url, image, thumbnail o images[0].
// Si no encuentra una imagen válida, usa una imagen local de respaldo.
export const getProductImageSrc = (product?: ProductImageSource | null) => {
  const imageSrc =
    product?.imageUrl ||
    product?.image_url ||
    product?.image ||
    product?.thumbnail ||
    product?.images?.[0];

  return normalizeImagePath(imageSrc) || getCategoryFallbackSrc(product);
};

// Esta función se usa en el onError de las imágenes.
// Si una imagen se rompe, evita que aparezca el ícono de imagen dañada.
export const handleProductImageError = (
  event: SyntheticEvent<HTMLImageElement>,
  product?: ProductImageSource | null
) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = getCategoryFallbackSrc(product);
};

// Estos aliases los dejo para no romper imports antiguos del proyecto.
// Así puedes usar getProductImage o getProductImageSrc según el archivo.
export const getProductImage = getProductImageSrc;
export const getCategoryFallbackImage = getCategoryFallbackSrc;

// Imagen general de respaldo, por si algún componente la necesita directamente.
export const FALLBACK_PRODUCT_IMAGE = getPublicPath(DEFAULT_FALLBACK_IMAGE);