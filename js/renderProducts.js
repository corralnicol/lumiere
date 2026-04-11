import { getProducts } from "./products.js";

document.addEventListener("DOMContentLoaded", async () => {
  const { products, error } = await getProducts();
  const container = document.querySelector("#products");

  if (error) {
    container.textContent = error;
    return;
  }

  container.innerHTML = products
    .map((p) => `<article><h3>${p.name}</h3><p>${p.price}</p></article>`)
    .join("");
});