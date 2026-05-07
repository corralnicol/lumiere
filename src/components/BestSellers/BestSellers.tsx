function BestSellers() {
  return (
    <section className="best-sellers">
      <div>
        <p>Most loved products</p>
        <h2>Best Sellers</h2>
      </div>

      <div className="products-grid">
        <article className="product-card">
          <img
            src="/images/best-sellers/product1.png"
            alt="Best seller product"
          />
          <h3>Hydrating Lip Oil</h3>
          <p>Lips</p>
          <strong>$45.000</strong>
          <button>View product</button>
        </article>
      </div>
    </section>
  );
}

export default BestSellers;