# Supabase — Local Development Guide

CLI workflow for this project. Every command has more options — discover them with
`supabase <group> <command> --help` rather than guessing (the CLI changes between versions).

- **Studio / API / DB URLs:** run `supabase status` after `supabase start`.
- **Schema reference:** [`SCHEMA.md`](./SCHEMA.md).

## 1. One-time setup

Only needed to connect this repo to the hosted project (for `db push`, remote types, etc.).
Local-only work does not require login.

```bash
supabase login                                  # authenticate the CLI
supabase link --project-ref rsfnxgkmpmxdylzrznui   # link repo → hosted project
```

## 2. Local stack lifecycle

```bash
supabase start     # boot the local stack (Postgres, Auth, Storage, Studio, …) in Docker
supabase status    # print local URLs, keys, and container health
supabase stop      # stop the stack (add --no-backup to discard local data)
```

## 3. Database & migrations

Migrations are the source of truth for the schema (`supabase/migrations/`). Typical loop:

```bash
supabase migration new <name>     # create supabase/migrations/<timestamp>_<name>.sql
# …edit the generated .sql…
supabase db reset                 # rebuild local DB from ALL migrations + seed.sql
supabase migration list           # compare local vs remote migration history
```

```bash
supabase migration up --local     # apply only pending migrations (no full rebuild)
```

> `supabase db reset` **drops and recreates the local database**, replays every migration,
> then runs `supabase/seed.sql`. It is the fastest way to iterate locally — and destructive,
> so local-only.

### Pushing to production

```bash
supabase db push                  # apply pending migrations to the LINKED remote project
```

> ⚠️ Run against production only after the migration is tested locally (`db reset` clean +
> queries verified). A bad migration can break the live database.

## 4. Seeding sample data

`supabase/seed.sql` is loaded automatically at the end of every `supabase db reset`
(configured under `[db.seed]` in `config.toml`). It is idempotent (`ON CONFLICT DO NOTHING`).

It creates three sign-in-ready users (sellers + buyer), products with reviews, favorites, a
ready cart, and historical orders so the analytics views have data.

| User | Role | Email | Password |
|---|---|---|---|
| Linus Torvalds | seller + buyer | `linus@lumiere.com` | `Password1234` |
| Bob Martin | seller | `bob@lumiere.com` | `Password1234` |
| Andrew Ng | buyer | `andrew@lumiere.com` | `Password1234` |

```bash
supabase db reset          # also runs seed.sql
supabase seed buckets      # (separate) create storage buckets declared in [storage.buckets]
```

## 5. Generating TypeScript types

Regenerate after any schema change so `src/types/database.ts` stays in sync:

```bash
supabase gen types typescript --local > src/types/database.ts
```

## 6. Running ad-hoc SQL

```bash
supabase db query --local "select count(*) from public.products;"
```

> `supabase db query` sends **one statement** per call. For multi-statement scripts, RLS
> testing (`set role authenticated` + JWT claims), or `\`-meta commands, use `psql` against the
> DB URL from `supabase status`.

## 7. Edge Functions

```bash
supabase functions new <name>     # scaffold supabase/functions/<name>
supabase functions serve          # run all functions locally (hot reload)
supabase functions deploy <name>  # deploy to the linked project
```

[Edge Functions reference →](https://supabase.com/docs/reference/cli/supabase-functions)
