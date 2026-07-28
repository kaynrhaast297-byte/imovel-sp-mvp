# Database Baseline Audit

Date: 2026-07-27
Branch: `chore/database-baseline`
Production project: `kedwoyyzhwyzcqdukzko`

## Problem

The repository contained only incremental security and Storage migrations. A fresh database could
not create `imoveis`, `leads`, `historico_precos`, or `alertas_preco` before those migrations ran.

## Evidence

- Git history contains the initial schema in commit `2701604` from 2026-06-01.
- Production metadata contains 4 public tables, 21 indexes, 11 constraints, 5 RLS policies,
  the `ensure_rls` event trigger, and the `property-images` bucket.
- Production migration history contains versions `20260607132339`, `20260607132440`, and
  `20260617233321`.
- The local Storage migration used a different timestamp: `20260608185118`.
- No `supabase/config.toml`, seed, database test, or fresh migration replay existed.

## Decision

- Recover an idempotent baseline ordered at the timestamp of the initial schema commit.
- Align the Storage migration filename with the production migration history.
- Keep fixtures in `supabase/seed.sql`; never include them in a production push.
- Recreate and test the database in GitHub Actions with Supabase CLI `2.110.0` and pgTAP.
- Do not run `db reset --linked` and do not mutate production during this PR.

Before this branch can be merged, version `20260601202625` must be reviewed and marked as already
applied in production migration history. The schema already exists there; replaying a baseline is
not the deployment strategy.

## Remaining findings

- Security Advisor: `pg_trgm` is installed in `public`; move it in a reviewed future migration.
- Performance Advisor: `historico_precos.imovel_id` has no covering index.
- Unused-index advisories need workload evidence before any index is removed.

## Sources

- Supabase local workflow: https://supabase.com/docs/guides/local-development/cli-workflows
- Supabase migrations: https://supabase.com/docs/guides/local-development/database-migrations
- Supabase database tests: https://supabase.com/docs/guides/database/testing
- Supabase CI testing: https://supabase.com/docs/guides/deployment/ci/testing
- pgTAP: https://pgtap.org/documentation.html
