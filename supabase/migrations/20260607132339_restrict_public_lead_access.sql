revoke all privileges on table public.leads from anon, authenticated;

drop policy if exists "Permitir envio publico de leads" on public.leads;
