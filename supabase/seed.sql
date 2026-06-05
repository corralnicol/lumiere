-- ============================================================================
-- Sample data for local development.
-- Loaded automatically by `supabase db reset` (see [db.seed] in config.toml).
-- Idempotent: every insert uses ON CONFLICT DO NOTHING, so it is safe to re-run.
--
-- All sample users share the password:  Password1234
--   linus@lumiere.com  (seller + buyer)   395e637f-...
--   bob@lumiere.com    (seller)           97f960fd-...
--   andrew@lumiere.com  (buyer)            57d9019a-...
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Auth users  (the handle_new_user trigger auto-creates the matching profiles)
-- ---------------------------------------------------------------------------
WITH new_users(id, email, first_name, last_name, phone) AS (
  VALUES
    ('395e637f-2b0b-48b6-bcc1-3c30b0f9575b'::uuid, 'linus@lumiere.com', 'Linus', 'Torvalds', '+1234567890'),
    ('97f960fd-8ce5-4215-aa25-45fd9222b536'::uuid, 'bob@lumiere.com',   'Bob',   'Martin', '+1234567891'),
    ('57d9019a-8227-4fa2-b378-d0b77662f7bc'::uuid, 'andrew@lumiere.com', 'Andrew', 'Ng', '+1234567892')
)
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at, updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  extensions.crypt('Password1234', extensions.gen_salt('bf')), now(),
    '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('first_name', u.first_name, 'last_name', u.last_name, 'phone', u.phone),
  now(), now()
FROM new_users u
ON CONFLICT (id) DO NOTHING;

-- Email/password identities so the seeded users can actually sign in.
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT
  u.id::text, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', now(), now(), now()
FROM auth.users u
WHERE u.id IN ('395e637f-2b0b-48b6-bcc1-3c30b0f9575b',
               '97f960fd-8ce5-4215-aa25-45fd9222b536',
               '57d9019a-8227-4fa2-b378-d0b77662f7bc')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Profile extras (avatars, favorites, cart). Profiles themselves come from the trigger.
-- ---------------------------------------------------------------------------
UPDATE public.profiles
SET avatar_url = 'avatars/' || id || '.png'
WHERE id IN ('395e637f-2b0b-48b6-bcc1-3c30b0f9575b',
             '97f960fd-8ce5-4215-aa25-45fd9222b536',
             '57d9019a-8227-4fa2-b378-d0b77662f7bc');

-- Linus favorites Bob's chair
UPDATE public.profiles
SET favorites = ARRAY['c4928b77-9d2e-4ebf-929a-7caef208692f'::uuid]
WHERE id = '395e637f-2b0b-48b6-bcc1-3c30b0f9575b';

-- Andrew favorites the lamp and the desk, and has a 2-item cart ready to check out
UPDATE public.profiles
SET favorites = ARRAY['0a1785a7-d9a1-4263-81a3-84520c296afa'::uuid, 'be946926-e330-4bd0-9d4b-80f9d91bd5f6'::uuid],
    cart      = '[{"product_id":"8df41f30-b061-4b36-a1a5-bc9355dbdf4e","quantity":1},
                  {"product_id":"c4928b77-9d2e-4ebf-929a-7caef208692f","quantity":2}]'::jsonb
WHERE id = '57d9019a-8227-4fa2-b378-d0b77662f7bc';

-- ---------------------------------------------------------------------------
-- Products  (reviews are embedded JSONB; one already-purchased product is inactive)
-- ---------------------------------------------------------------------------
INSERT INTO public.products (id, seller_id, name, description, price, stock, active, image_url, reviews) VALUES
  ('0a1785a7-d9a1-4263-81a3-84520c296afa','395e637f-2b0b-48b6-bcc1-3c30b0f9575b',
   'Ceramic Table Lamp','Warm-toned stoneware lamp with linen shade.', 49.99, 8, true,
   'products/0a1785a7-d9a1-4263-81a3-84520c296afa.png',
   '[{"reviewer_id":"57d9019a-8227-4fa2-b378-d0b77662f7bc","reviewer_name":"Andrew Ng","rating":5,"text":"Beautiful, warm light.","created_at":"2026-05-20T10:00:00Z"},
     {"reviewer_id":"97f960fd-8ce5-4215-aa25-45fd9222b536","reviewer_name":"Bob Martin","rating":4,"text":"Solid build, fast shipping.","created_at":"2026-05-21T12:30:00Z"}]'::jsonb),

  ('8df41f30-b061-4b36-a1a5-bc9355dbdf4e','395e637f-2b0b-48b6-bcc1-3c30b0f9575b',
   'Stoneware Vase','Hand-thrown matte vase, 25cm.', 24.50, 20, true,
   'products/8df41f30-b061-4b36-a1a5-bc9355dbdf4e.png', '[]'::jsonb),

  ('48f8e461-68ab-4026-9c02-efac2c818d93','395e637f-2b0b-48b6-bcc1-3c30b0f9575b',
   'Wool Area Rug (retired)','Discontinued line — kept for order history.', 120.00, 0, false,
   'products/48f8e461-68ab-4026-9c02-efac2c818d93.png', '[]'::jsonb),

  ('c4928b77-9d2e-4ebf-929a-7caef208692f','97f960fd-8ce5-4215-aa25-45fd9222b536',
   'Oak Dining Chair','Solid oak, oil finish.', 89.00, 5, true,
   'products/c4928b77-9d2e-4ebf-929a-7caef208692f.png',
   '[{"reviewer_id":"57d9019a-8227-4fa2-b378-d0b77662f7bc","reviewer_name":"Andrew Ng","rating":5,"text":"Very comfortable.","created_at":"2026-05-25T09:15:00Z"}]'::jsonb),

  ('be946926-e330-4bd0-9d4b-80f9d91bd5f6','97f960fd-8ce5-4215-aa25-45fd9222b536',
   'Walnut Writing Desk','Compact desk with cable channel.', 210.00, 3, true,
   'products/be946926-e330-4bd0-9d4b-80f9d91bd5f6.png', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Orders + line items (snapshots), so analytics views have data.
-- Inserted directly (not via place_order) because seeding has no auth.uid() context.
-- ---------------------------------------------------------------------------
INSERT INTO public.orders (id, buyer_id, seller_ids, status, created_at) VALUES
  ('2a3f5b29-8f92-47e3-8853-180e7d34a698','57d9019a-8227-4fa2-b378-d0b77662f7bc',
   ARRAY['395e637f-2b0b-48b6-bcc1-3c30b0f9575b','97f960fd-8ce5-4215-aa25-45fd9222b536']::uuid[],
   'completed', now() - interval '7 days'),
  ('cba8a9b5-8642-4fba-86c1-d6e3deaa64d2','57d9019a-8227-4fa2-b378-d0b77662f7bc',
   ARRAY['395e637f-2b0b-48b6-bcc1-3c30b0f9575b']::uuid[],
   'pending', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (order_id, product_id, seller_id, quantity, unit_price) VALUES
  ('2a3f5b29-8f92-47e3-8853-180e7d34a698','0a1785a7-d9a1-4263-81a3-84520c296afa','395e637f-2b0b-48b6-bcc1-3c30b0f9575b',1, 49.99),
  ('2a3f5b29-8f92-47e3-8853-180e7d34a698','c4928b77-9d2e-4ebf-929a-7caef208692f','97f960fd-8ce5-4215-aa25-45fd9222b536',1, 89.00),
  ('cba8a9b5-8642-4fba-86c1-d6e3deaa64d2','8df41f30-b061-4b36-a1a5-bc9355dbdf4e','395e637f-2b0b-48b6-bcc1-3c30b0f9575b',2, 24.50)
ON CONFLICT (order_id, product_id) DO NOTHING;
