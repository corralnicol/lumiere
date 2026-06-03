# Database Schema

**Stack:** Supabase (PostgreSQL 17) · Supabase Auth · Supabase Storage

**Last updated:** 2026-06-03

Canonical reference for all agents and developers. The authoritative schema lives in the SQL
files under `supabase/migrations/`; this document mirrors them. The snippets below are kept
faithful to the migrations but remain illustrative — always test changes in a local
environment (`supabase db reset`) before applying to production.

Migrations:
- `20260524042230_create_profiles.sql` — profiles, auth triggers, `updated_at`, avatars bucket
- `20260524045613_create_products.sql` — `profiles.favorites`, products, FTS, `toggle_favorite`, `add_review`, products bucket
- `20260524071548_create_orders.sql` — `profiles.cart`, orders, order_items, `place_order`, analytics views

## Table of Contents

- [Tables](#tables)
  - [`profiles`](#profiles)
  - [`products`](#products)
  - [`orders`](#orders)
  - [`order_items`](#order_items)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Row Level Security](#row-level-security)
- [Functions & Triggers](#functions--triggers)
- [Analytics Views](#analytics-views)
- [Storage Buckets](#storage-buckets)
- [Environment Variables](#environment-variables)
- [Known Tech Debt](#known-tech-debt)

## Tables

### `profiles`

Extends `auth.users` with a strict 1:1 relationship. Created automatically on signup via the
`handle_new_user` trigger; `email` is kept in sync with `auth.users` by
`handle_user_email_updated`. A profile carries no intrinsic role — it acts as a **buyer** when
referenced by `orders.buyer_id`, and as a **seller** when it owns rows in `products` or appears
in `orders.seller_ids` / `order_items.seller_id`. Both roles can be active simultaneously.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users(id)` ON DELETE CASCADE | Shares UUID with the auth user |
| `email` | `text` | NOT NULL, UNIQUE | Mirrored from `auth.users.email` |
| `first_name` | `text` | | From `raw_user_meta_data.first_name` at signup |
| `last_name` | `text` | | From `raw_user_meta_data.last_name` at signup |
| `avatar_url` | `text` | | Storage path: `avatars/{user_id}.png` |
| `favorites` | `jsonb` | NOT NULL DEFAULT `'[]'` | `[product_id, ...]` — see [tech debt](#known-tech-debt) |
| `cart` | `jsonb` | NOT NULL DEFAULT `'[]'` | `[{ product_id, quantity }]` — see [tech debt](#known-tech-debt) |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT `now()` | Stamped by `set_updated_at` trigger on UPDATE |

```sql
CREATE TABLE profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email       text        NOT NULL UNIQUE,
  first_name  text,
  last_name   text,
  avatar_url  text,
  favorites   jsonb       NOT NULL DEFAULT '[]',  -- added by the products migration
  cart        jsonb       NOT NULL DEFAULT '[]',  -- added by the orders migration
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

> `favorites` and `cart` are added by later migrations (`ALTER TABLE`), not in the initial
> `profiles` migration. The cart holds `{ product_id, quantity }` entries; `place_order`
> aggregates duplicates and always reads the live product price (no cached price snapshot).

### `products`

Listings owned by a seller profile. Products are never hard-deleted; they are deactivated via
`active = false`, because `order_items.product_id` references this table (`ON DELETE RESTRICT`)
and historical orders must remain intact.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `seller_id` | `uuid` | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | Set to `auth.uid()` on insert |
| `name` | `text` | NOT NULL | |
| `description` | `text` | | |
| `price` | `numeric(12,2)` | NOT NULL, CHECK `price >= 0` | |
| `stock` | `int` | NOT NULL DEFAULT `0`, CHECK `stock >= 0` | Decremented atomically in `place_order` |
| `active` | `boolean` | NOT NULL DEFAULT `true` | `false` = soft-deleted; replaces hard DELETE |
| `image_url` | `text` | | Storage path: `products/{uuid}.png` |
| `reviews` | `jsonb` | NOT NULL DEFAULT `'[]'` | `[{ reviewer_id, reviewer_name, rating, text, created_at }]` — see [tech debt](#known-tech-debt) |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` | |

```sql
CREATE TABLE products (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text          NOT NULL,
  description text,
  price       numeric(12,2) NOT NULL CHECK (price >= 0),
  stock       int           NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active      boolean       NOT NULL DEFAULT true,
  image_url   text,
  reviews     jsonb         NOT NULL DEFAULT '[]',
  created_at  timestamptz   NOT NULL DEFAULT now()
);
```

> **Delisting a product:** `UPDATE products SET active = false WHERE id = $1 AND seller_id = auth.uid()`.
> Hard `DELETE` is blocked by `ON DELETE RESTRICT` on `order_items.product_id` once the product
> has been purchased.

### `orders`

Transaction header. Binds one buyer to one or more sellers in a single checkout. `seller_ids`
is a denormalized array computed from the cart at the moment `place_order` runs — it exists to
allow seller-scoped RLS and fast analytics without joining through `order_items` every time.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `buyer_id` | `uuid` | NOT NULL, FK → `profiles(id)` ON DELETE RESTRICT | The purchasing user; deletion blocked while orders exist |
| `seller_ids` | `uuid[]` | NOT NULL | Distinct seller IDs across all line items; computed in `place_order` |
| `status` | `order_status` | NOT NULL DEFAULT `'pending'` | Enum: `pending`, `completed`, `cancelled` |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` | |

```sql
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'cancelled');

CREATE TABLE orders (
  id          uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id    uuid                NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  seller_ids  uuid[]              NOT NULL,
  status      order_status        NOT NULL DEFAULT 'pending',
  created_at  timestamptz         NOT NULL DEFAULT now()
);
```

> **No `total` column on `orders`.** The authoritative total is always
> `SUM(unit_price * quantity)` from `order_items`; a stored total can drift from the line items.

### `order_items`

Normalized line items. Each row is one product within an order. `seller_id` and `unit_price`
are **snapshots** captured at purchase time — they do not change if the underlying product is
later modified or deactivated. The `UNIQUE (order_id, product_id)` constraint guarantees one
line per product per order; `place_order` aggregates duplicate cart entries to honour it.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `order_id` | `uuid` | NOT NULL, FK → `orders(id)` ON DELETE CASCADE | |
| `product_id` | `uuid` | NOT NULL, FK → `products(id)` ON DELETE RESTRICT | RESTRICT preserves history; deactivate products instead |
| `seller_id` | `uuid` | NOT NULL, FK → `profiles(id)` | Snapshot of `products.seller_id` at purchase time |
| `quantity` | `int` | NOT NULL, CHECK `quantity > 0` | |
| `unit_price` | `numeric(12,2)` | NOT NULL, CHECK `unit_price >= 0` | Snapshot of `products.price` at purchase time |
| `created_at` | `timestamptz` | NOT NULL DEFAULT `now()` | |

```sql
CREATE TABLE order_items (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  uuid          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  seller_id   uuid          NOT NULL REFERENCES profiles(id),
  quantity    int           NOT NULL CHECK (quantity > 0),
  unit_price  numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  created_at  timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT unique_product_per_order UNIQUE (order_id, product_id)
);
```

## Relationships

```
auth.users
    │
    └─1:1──► profiles
                │
                ├─1:N──► products ──────────────────────────┐
                │         (seller_id)                        │
                │                                            │
                ├─1:N──► orders (buyer_id)                  │
                │         │                                  │
                │         │  seller_ids[] ──────────────────►│ (array ref, not FK)
                │         │                                  │
                │         └─1:N──► order_items ◄─────────────┘
                │                   (order_id)   (product_id)
                │                        │
                └────────────────────────┘
                         (seller_id — snapshot)
```

## Indexes

```sql
-- products
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_active    ON products(active) WHERE active = true;
CREATE INDEX idx_products_fts
  ON products USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));

-- orders
CREATE INDEX idx_orders_buyer_id   ON orders(buyer_id);
CREATE INDEX idx_orders_seller_ids ON orders USING gin(seller_ids); -- array containment queries

-- order_items
CREATE INDEX idx_order_items_order_id   ON order_items(order_id);   -- primary access pattern
CREATE INDEX idx_order_items_product_id ON order_items(product_id); -- product history lookups
CREATE INDEX idx_order_items_seller_id  ON order_items(seller_id);  -- seller analytics
```

## Row Level Security

RLS is enabled on every table. Policies name their target role with `TO` (not the deprecated
`auth.role()`), and `auth.uid()` is wrapped in a scalar subselect `(select auth.uid())` so the
planner evaluates it once per statement.

```sql
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- profiles: any authenticated user may read (to show names/avatars); only the owner may update.
-- No INSERT policy (rows come from handle_new_user). No DELETE policy (cascades from auth.users).
CREATE POLICY "profiles: authenticated users can read all"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles: users can update their own"
  ON profiles FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

-- products: anon sees active listings; authenticated sees active + their own (incl. inactive).
CREATE POLICY "products: anon read active"
  ON products FOR SELECT TO anon USING (active = true);

CREATE POLICY "products: authenticated read"
  ON products FOR SELECT TO authenticated
  USING (active = true OR (select auth.uid()) = seller_id);

CREATE POLICY "products: seller insert"
  ON products FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = seller_id);

CREATE POLICY "products: seller update"
  ON products FOR UPDATE TO authenticated
  USING ((select auth.uid()) = seller_id) WITH CHECK ((select auth.uid()) = seller_id);
-- No DELETE policy on products intentionally — use active = false.

-- orders: visible to the buyer and any seller in seller_ids. Writes only via place_order RPC.
CREATE POLICY "orders: participant read"
  ON orders FOR SELECT TO authenticated
  USING ((select auth.uid()) = buyer_id OR seller_ids @> ARRAY[(select auth.uid())]);

-- order_items: visible if the parent order is visible. Writes only via place_order RPC.
CREATE POLICY "order_items: participant read"
  ON order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = (select auth.uid())
           OR orders.seller_ids @> ARRAY[(select auth.uid())])
  ));
```

## Functions & Triggers

All functions pin `SET search_path = ''` and fully schema-qualify their references. The
`SECURITY DEFINER` functions additionally `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated`
where they are meant to be invoked only by triggers.

### Trigger function: `set_updated_at` (SECURITY INVOKER)

Stamps `updated_at = now()` on update. Attached to `profiles` as `trg_profiles_updated_at`.

### Trigger: `handle_new_user` (SECURITY DEFINER)

Fires `AFTER INSERT ON auth.users`; inserts the matching `profiles` row.

```sql
CREATE FUNCTION handle_new_user() RETURNS trigger
SET search_path = '' LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, avatar_url)
  VALUES (NEW.id, NEW.email,
          NEW.raw_user_meta_data->>'first_name',
          NEW.raw_user_meta_data->>'last_name',
          NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END; $$;
```

### Trigger: `handle_user_email_updated` (SECURITY DEFINER)

Fires `AFTER UPDATE OF email ON auth.users` when the email actually changes, and propagates the
new address to `profiles.email`, keeping the mirror in sync.

### RPC: `toggle_favorite(p_product_id uuid) → jsonb` (SECURITY INVOKER)

Toggles a product in/out of `profiles.favorites` for the calling user and returns the updated
array. Runs as the caller, so it relies on the profiles SELECT/UPDATE policies; raises
`Not authenticated` when `auth.uid()` is null.

### RPC: `add_review(p_product_id uuid, p_text text, p_rating int) → jsonb` (SECURITY DEFINER)

Appends a review to `products.reviews` and returns the updated array. Enforces: authenticated
caller, `rating` in 1–5, product exists and is `active`, and one review per user per product
(it takes `FOR UPDATE` on the product row to serialize concurrent reviewers). The stored review
is `{ reviewer_id, reviewer_name, rating, text, created_at }`, where `reviewer_name` is the
reviewer's `first_name last_name` resolved at write time.

### RPC: `place_order() → uuid` (SECURITY DEFINER)

The critical write path; runs in a single transaction. EXECUTE is revoked from `PUBLIC`/`anon`
and granted to `authenticated`.

1. Read the caller's `cart`; reject an empty cart.
2. **Aggregate the cart by `product_id`** (sum quantities) so a duplicated item becomes one
   correct line and stock is decremented once.
3. For each product: lock the row `FOR UPDATE`, validate `quantity > 0`, `active = true`, and
   `stock >= quantity`, and snapshot `seller_id` + live `price`. **Any failure rolls back the
   whole order.**
4. Insert one `orders` row with the distinct `seller_ids`.
5. Insert one `order_items` row per aggregated line (seller_id + unit_price snapshots).
6. Decrement `products.stock` for each line.
7. Clear `profiles.cart`. Return the new `order.id`.

```sql
-- Aggregation step (step 2/3):
FOR v_item IN
  SELECT (elem->>'product_id')::uuid   AS product_id,
         SUM((elem->>'quantity')::int) AS quantity
  FROM jsonb_array_elements(v_cart) AS elem
  GROUP BY 1
LOOP
  IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
    RAISE EXCEPTION 'Invalid quantity for product %', v_item.product_id;
  END IF;
  SELECT id, seller_id, price, stock, active INTO v_product
  FROM public.products WHERE id = v_item.product_id FOR UPDATE;
  ... -- validate + snapshot into v_items
END LOOP;
```

> **Price source of truth:** `unit_price` is read from `products.price` at execution time, not
> from any cached cart value — price is confirmed at checkout.

## Analytics Views

Both views are defined `WITH (security_invoker = true)` (Postgres 15+), so the underlying-table
RLS is evaluated as the querying user, and both filter to `(select auth.uid())`.

**`avg_order_value` is computed per *order*, not per line item** — i.e.
`SUM(unit_price * quantity) / COUNT(DISTINCT order_id)`. (A plain `AVG(unit_price*quantity)`
would average over line items and understate/oversate multi-item orders.)

### Buyer Analytics

```sql
CREATE OR REPLACE VIEW buyer_analytics WITH (security_invoker = true) AS
SELECT
  o.buyer_id                                       AS profile_id,
  COUNT(DISTINCT o.id)                             AS total_orders,
  SUM(oi.unit_price * oi.quantity)                 AS total_spent,
  SUM(oi.unit_price * oi.quantity)
    / COUNT(DISTINCT o.id)                         AS avg_order_value,
  MAX(o.created_at)                                AS last_order_at,
  ( SELECT oi2.product_id
    FROM order_items oi2 JOIN orders o2 ON o2.id = oi2.order_id
    WHERE o2.buyer_id = o.buyer_id
    GROUP BY oi2.product_id ORDER BY SUM(oi2.quantity) DESC LIMIT 1
  )                                                AS top_product_id
FROM orders o JOIN order_items oi ON oi.order_id = o.id
WHERE o.buyer_id = (select auth.uid())
GROUP BY o.buyer_id;
```

### Seller Analytics

Queries through `order_items.seller_id` directly — no array unpacking needed.

```sql
CREATE OR REPLACE VIEW seller_analytics WITH (security_invoker = true) AS
SELECT
  oi.seller_id                                     AS profile_id,
  COUNT(DISTINCT oi.order_id)                      AS total_orders,
  SUM(oi.unit_price * oi.quantity)                 AS total_revenue,
  SUM(oi.unit_price * oi.quantity)
    / COUNT(DISTINCT oi.order_id)                  AS avg_order_value,
  ( SELECT oi2.product_id FROM order_items oi2
    WHERE oi2.seller_id = oi.seller_id
    GROUP BY oi2.product_id ORDER BY SUM(oi2.quantity) DESC LIMIT 1
  )                                                AS top_product_by_units,
  ( SELECT oi2.product_id FROM order_items oi2
    WHERE oi2.seller_id = oi.seller_id
    GROUP BY oi2.product_id ORDER BY SUM(oi2.unit_price * oi2.quantity) DESC LIMIT 1
  )                                                AS top_product_by_revenue
FROM order_items oi
WHERE oi.seller_id = (select auth.uid())
GROUP BY oi.seller_id;
```

## Storage Buckets

| Bucket | Path pattern | Read | Write |
|---|---|---|---|
| `avatars` | `avatars/{user_id}.png` | Public | Owner only (`name = 'avatars/' \|\| auth.uid() \|\| '.png'`), `TO authenticated` |
| `products` | `products/{uuid}.png` | Public | Any `authenticated` user |

```sql
-- avatars
CREATE POLICY "avatars: public read"  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "avatars: owner write"  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars'
              AND name = 'avatars/' || (select auth.uid())::text || '.png');

-- products
CREATE POLICY "products: public read"        ON storage.objects FOR SELECT
  USING (bucket_id = 'products');
CREATE POLICY "products: authenticated write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products');
```

## Environment Variables

| Variable | Scope | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Client | Project API URL (read by `src/lib/supabase.ts`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Publishable key — safe to expose; RLS is the auth layer |

> Never expose the `service_role` / secret key to the client. It bypasses all RLS policies.

## Known Tech Debt

| Item | Location | Impact | Resolution path |
|---|---|---|---|
| `favorites` as JSONB | `profiles.favorites` | No referential integrity; stale IDs if a product is deactivated | Normalize to `profile_favorites(profile_id, product_id)` |
| `cart` as JSONB | `profiles.cart` | No referential integrity; client-managed shape | Normalize to `cart_items(profile_id, product_id, quantity)`; price already read live at checkout |
| `reviews` as JSONB | `products.reviews` | Not individually queryable/sortable without GIN overhead; `reviewer_name` is a denormalized snapshot | Normalize to `product_reviews(product_id, reviewer_id, rating, text, created_at)` |
| Email mirror | `profiles.email` | The owner-update policy lets a user write `profiles.email` directly, drifting from `auth.users` | Restrict updatable columns (column-level grants or a trigger), or drop the mirror and read from `auth.users` |
| All-or-nothing stock check | `place_order` | Entire order fails if any single item is out of stock | Per-item partial fulfillment with split orders, or pre-checkout stock validation on the client |
