-- Catálogo verificado em DESIGN.md. Nenhuma categoria é criada automaticamente.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  name text not null check (name ~ '[^[:space:]]'),
  color text not null check (color in ('green', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow')),
  icon text not null check (icon in (
    'briefcase-business', 'car-front', 'heart-pulse', 'piggy-bank',
    'shopping-cart', 'ticket', 'tool-case', 'utensils', 'paw-print',
    'house', 'gift', 'dumbbell', 'book-open', 'baggage-claim', 'mailbox', 'receipt-text'
  )),
  created_at timestamptz not null default now(),
  unique (user_id, id)
);

create unique index categories_owner_name_key on public.categories (user_id, lower(btrim(name)));

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  category_id uuid not null,
  description text not null check (description ~ '[^[:space:]]'),
  kind text not null check (kind in ('income', 'expense')),
  amount numeric not null check (amount > 0 and amount not in ('NaN'::numeric, 'Infinity'::numeric, '-Infinity'::numeric) and scale(amount) <= 2),
  occurred_on date not null check (isfinite(occurred_on) and occurred_on <= (now() at time zone 'America/Sao_Paulo')::date),
  created_at timestamptz not null default now(),
  foreign key (user_id, category_id) references public.categories (user_id, id) on delete restrict
);

create index transactions_owner_date_idx on public.transactions (user_id, occurred_on desc, created_at desc, id desc);
create index transactions_owner_category_idx on public.transactions (user_id, category_id);

create schema if not exists private;

create function private.prepare_financial_row()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and (new.id is distinct from old.id or new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at) then
    raise exception using errcode = '23514', message = 'Identidade, dono e criação são imutáveis.';
  end if;
  if tg_table_name = 'categories' then
    new.name := btrim(new.name);
  else
    new.description := btrim(new.description);
    -- Verificar a escala original antes de canonizar; numeric(p,2) arredondaria cedo demais.
    if new.amount is null or new.amount <= 0 or new.amount in ('NaN'::numeric, 'Infinity'::numeric, '-Infinity'::numeric) or scale(new.amount) > 2 then
      raise exception using errcode = '23514', message = 'Valor deve ser positivo, finito e ter até duas casas decimais.';
    end if;
    new.amount := trunc(new.amount, 2);
  end if;
  return new;
end;
$$;

revoke all on function private.prepare_financial_row() from public, anon, authenticated, service_role;

create trigger prepare_category before insert or update on public.categories
for each row execute function private.prepare_financial_row();
create trigger prepare_transaction before insert or update on public.transactions
for each row execute function private.prepare_financial_row();

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy categories_select on public.categories for select to authenticated using ((select auth.uid()) = user_id);
create policy categories_insert on public.categories for insert to authenticated with check ((select auth.uid()) = user_id);
create policy categories_update on public.categories for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy categories_delete on public.categories for delete to authenticated using ((select auth.uid()) = user_id);

create policy transactions_select on public.transactions for select to authenticated using ((select auth.uid()) = user_id);
create policy transactions_insert on public.transactions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy transactions_update on public.transactions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy transactions_delete on public.transactions for delete to authenticated using ((select auth.uid()) = user_id);

-- Remover os grants herdados antes de conceder somente as operações/colunas necessárias.
revoke all on public.categories, public.transactions from public, anon, authenticated, service_role;
grant usage on schema public to authenticated;
grant select, delete on public.categories, public.transactions to authenticated;
grant insert (user_id, name, color, icon) on public.categories to authenticated;
grant update (name, color, icon) on public.categories to authenticated;
grant insert (user_id, category_id, description, kind, amount, occurred_on) on public.transactions to authenticated;
grant update (category_id, description, kind, amount, occurred_on) on public.transactions to authenticated;

-- O SDK tipa numeric como number; esta fronteira aceita texto sem converter dinheiro em JS.
create function public.save_transaction(
  p_description text,
  p_kind text,
  p_amount text,
  p_occurred_on date,
  p_category_id uuid,
  p_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Autenticação obrigatória.';
  end if;
  if p_id is null then
    insert into public.transactions (description, kind, amount, occurred_on, category_id)
    values (p_description, p_kind, p_amount::numeric, p_occurred_on, p_category_id)
    returning id into saved_id;
  else
    update public.transactions
    set description = p_description, kind = p_kind, amount = p_amount::numeric,
        occurred_on = p_occurred_on, category_id = p_category_id
    where id = p_id
    returning id into saved_id;
    if saved_id is null then
      raise exception using errcode = 'P0002', message = 'Transação indisponível.';
    end if;
  end if;
  return saved_id;
end;
$$;

revoke all on function public.save_transaction(text, text, text, date, uuid, uuid) from public, anon, authenticated, service_role;
grant execute on function public.save_transaction(text, text, text, date, uuid, uuid) to authenticated;
