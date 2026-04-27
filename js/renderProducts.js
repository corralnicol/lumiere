import { getProducts } from "./products.js";

document.addEventListener("DOMContentLoaded", async () => {
  const { products, error } = await getProducts();
  const container = document.querySelector("#products");
  const summary = document.querySelector("[data-products-summary]");

  if (!container || !summary) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const categoryFilter = params.get("category");

  if (error) {
    summary.textContent = "We could not load the catalog right now.";
    container.innerHTML = `<article class="products-empty">${error}</article>`;
    return;
  }

  const filteredProducts = categoryFilter
    ? products.filter((product) => product.category === categoryFilter)
    : products;

  if (filteredProducts.length === 0) {
    summary.textContent = `No products found for category "${categoryFilter}".`;
    container.innerHTML = `<article class="products-empty">No products matched that category yet. Try another section from the landing page.</article>`;
    return;
  }

  summary.textContent = categoryFilter
    ? `Showing ${filteredProducts.length} product${filteredProducts.length > 1 ? "s" : ""} in ${categoryFilter}.`
    : `Showing ${filteredProducts.length} curated products from the mocked catalog.`;

  container.innerHTML = filteredProducts
    .map((p) => `
      <article class="product-card">
        <img src="${p.imageUrl}" alt="${p.name}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 12px; margin-bottom: 16px; background-color: #fff;">
        <h3>${p.name}</h3>
        <p class="product-meta">$${p.price} - ${p.brand}</p>
        <p class="product-copy">${p.description}</p>
        <div class="product-tags">
          <span>${p.category}</span>
          <span>${p.rating > 0 ? `${p.rating} stars` : "New arrival"}</span>
          <span>${p.reviews.length} review${p.reviews.length === 1 ? "" : "s"}</span>
        </div>
      </article>
    `)
    .join("");
});
