// Lumiere Beauty data
const sellerId = "01e36862-3c22-4622-93a3-630e8e7b81bc";

import products from "../src/data/products.json" with { type: "json" };
import users from "./users.json" with { type: "json" };

interface SupabaseProductReview {
  reviewer_id:   string;
  reviewer_name: string;
  rating:        number;
  text:          string;
}

interface SupabaseProduct {
  id:              string;
  seller_id:       string;
  name:            string;
  description:     string;
  price:           number;
  stock:           number;
  active:          boolean;
  image_url:       string;
  reviews:         string; // JSON string for Bun.sql
  category:        string | null;
  brand:           string;
  size:            string | null;
  how_to_use:      string | null;
  ingredients:     string | null;
  characteristics: string; // JSON string for Bun.sql
}

function randomUser() {
  return users[Math.floor(Math.random() * users.length)]!;
}

const rows: SupabaseProduct[] = products.map((p) => {
  const reviews: SupabaseProductReview[] = p.reviews.map((r) => {
    const user = randomUser();
    return {
      reviewer_id:   user.uuid,
      reviewer_name: `${user.first_name} ${user.last_name}`,
      rating:        r.rating,
      text:          r.comment,
    };
  });

  return {
    id:              p.id,
    seller_id:       sellerId,
    name:            p.name,
    description:     p.description,
    price:           p.price,
    stock:           p.stock,
    active:          true,
    image_url:       p.imageUrl,
    reviews:         JSON.stringify(reviews),
    category:        p.category ?? null,
    brand:           p.brand,
    size:            p.size ?? null,
    how_to_use:      p.howToUse ?? null,
    ingredients:     p.ingredients ?? null,
    characteristics: JSON.stringify(p.characteristics ?? []),
  };
});

const sql = new Bun.SQL(process.env.DATABASE_URL!);

for (const row of rows) {
  await sql`
    INSERT INTO public.products (
      id, seller_id, name, description, price, stock, active, image_url,
      reviews, category, brand, size, how_to_use, ingredients, characteristics
    ) VALUES (
      ${row.id}::uuid,
      ${row.seller_id}::uuid,
      ${row.name},
      ${row.description},
      ${row.price},
      ${row.stock},
      ${row.active},
      ${row.image_url},
      ${row.reviews}::jsonb,
      ${row.category},
      ${row.brand},
      ${row.size},
      ${row.how_to_use},
      ${row.ingredients},
      ${row.characteristics}::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      seller_id       = EXCLUDED.seller_id,
      name            = EXCLUDED.name,
      description     = EXCLUDED.description,
      price           = EXCLUDED.price,
      stock           = EXCLUDED.stock,
      active          = EXCLUDED.active,
      image_url       = EXCLUDED.image_url,
      reviews         = EXCLUDED.reviews,
      category        = EXCLUDED.category,
      brand           = EXCLUDED.brand,
      size            = EXCLUDED.size,
      how_to_use      = EXCLUDED.how_to_use,
      ingredients     = EXCLUDED.ingredients,
      characteristics = EXCLUDED.characteristics
  `;
  console.log(`Inserted: ${row.name}`);
}

await sql.end();
console.log(`Done. Inserted ${rows.length} products.`);
