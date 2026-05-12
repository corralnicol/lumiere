import { Link } from "react-router-dom";
import { homeCategories } from "../../data/homeContent";

function Categories() {
  return (
    <section className="categories" id="categories">
      <h2 className="categories-title">Explore Our Categories</h2>

      <p className="section-feedback" aria-live="polite">
        Use the search bar to jump to matching products or categories.
      </p>

      <div className="carousel">
        <div className="carousel-track">
          {[0, 1].map((groupIndex) => (
            <div
              className="group"
              aria-hidden={groupIndex === 1 ? "true" : undefined}
              key={groupIndex}
            >
              {homeCategories.map((category) => (
                <Link
                  to={`/products?category=${category.id}`}
                  className="category-card"
                  data-search-target={category.searchTarget}
                  tabIndex={groupIndex === 1 ? -1 : undefined}
                  key={`${groupIndex}-${category.id}`}
                >
                  <div className="category-box">
                    <div className="category-img-wrap">
                      <img
                        src={category.src}
                        alt={groupIndex === 1 ? "" : category.alt}
                        className={`category-img ${category.imageClassName}`}
                      />
                    </div>

                    <p>{category.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;