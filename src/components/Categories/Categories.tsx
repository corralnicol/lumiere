const categories = ["Skincare", "Makeup", "Haircare", "Fragrance"];

function Categories() {
  return (
    <section className="categories">
      <h2>Shop by category</h2>

      <div className="categories-grid">
        {categories.map((category) => (
          <article className="category-card" key={category}>
            <h3>{category}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Categories;