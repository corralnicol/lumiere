/**
 * Obtiene la lista de productos desde `/products.json`.
 *
 * La función realiza una petición HTTP y devuelve siempre un objeto con:
 * - `products`: arreglo de productos (`undefined` si ocurre un error).
 * - `error`: `undefined` si todo va bien, o un mensaje de error en caso contrario.
 *
 * @async
 * @function getProducts
 * @returns {Promise<{products: Array<any>, error: undefined} | {products: undefined, error: string}>}
 * Promesa que resuelve a un objeto con los productos y el estado de error.
 *
 * @example
 * // Uso básico en otro script (ES Modules)
 * import { getProducts } from "./products.js";
 *
 * async function init() {
 *   const { products, error } = await getProducts();
 *
 *   if (error) {
 *     console.error(error);
 *     return;
 *   }
 *
 *   console.log("Productos cargados:", products);
 * }
 *
 * init();
 *
 * @example
 * // Renderizar productos en la UI desde otro script
 * import { getProducts } from "./products.js";
 *
 * document.addEventListener("DOMContentLoaded", async () => {
 *   const { products, error } = await getProducts();
 *   const container = document.querySelector("#products");
 *
 *   if (error) {
 *     container.textContent = error;
 *     return;
 *   }
 *
 *   container.innerHTML = products
 *     .map((p) => `<article><h3>${p.name}</h3><p>${p.price}</p></article>`)
 *     .join("");
 * });
 */
export async function getProducts() {
  let products = [];

  try {
    const res = await fetch("data/products.json?t=" + new Date().getTime());

    if (!res.ok) {
      return {
        products: undefined,
        error: `Ocurrió un error al cargar los productos, error ${res.status}`
      };
    }

    products = await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: undefined,
      error: `Ocurrió un error al cargar los productos, error ${res.status}`
    };
  }

  if (!Array.isArray(products)) {
    return {
      products: undefined,
      error: "El formato de los productos es incorrecto"
    };
  }

  return { products, error: undefined };
}