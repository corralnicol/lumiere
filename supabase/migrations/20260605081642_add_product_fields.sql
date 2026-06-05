ALTER TABLE public.products
  ADD COLUMN category        text,
  ADD COLUMN brand           text NOT NULL DEFAULT '',
  ADD COLUMN size            text NOT NULL DEFAULT '',
  ADD COLUMN how_to_use      text NOT NULL DEFAULT '',
  ADD COLUMN ingredients     text NOT NULL DEFAULT '',
  ADD COLUMN characteristics jsonb NOT NULL DEFAULT '[]';
