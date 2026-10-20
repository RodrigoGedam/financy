alter table public.categories add column description text;

-- Autorização expressa: apenas a nova coluna; políticas e demais grants preservados.
grant insert (description), update (description) on public.categories to authenticated;

create or replace function private.prepare_financial_row()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  trim_chars constant text := U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF';
begin
  if tg_op = 'UPDATE' and (new.id is distinct from old.id or new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at) then
    raise exception using errcode = '23514', message = 'Identidade, dono e criação são imutáveis.';
  end if;
  if tg_table_name = 'categories' then
    new.name := btrim(new.name, trim_chars);
    new.description := nullif(btrim(new.description, trim_chars), '');
  else
    new.description := btrim(new.description, trim_chars);
    -- Verificar a escala original antes de canonizar; numeric(p,2) arredondaria cedo demais.
    if new.amount is null or new.amount <= 0 or new.amount in ('NaN'::numeric, 'Infinity'::numeric, '-Infinity'::numeric) or scale(new.amount) > 2 then
      raise exception using errcode = '23514', message = 'Valor deve ser positivo, finito e ter até duas casas decimais.';
    end if;
    new.amount := trunc(new.amount, 2);
  end if;
  return new;
end;
$$;

create or replace function public.get_dashboard(p_month date)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare
  caller_id uuid := auth.uid();
  next_month date;
  result jsonb;
begin
  if caller_id is null then
    raise exception using errcode = '42501', message = 'Autenticação obrigatória.';
  end if;
  if p_month is null or not isfinite(p_month) or extract(day from p_month) <> 1 then
    raise exception using errcode = '22023', message = 'Informe o primeiro dia de um mês válido.';
  end if;
  next_month := (p_month + interval '1 month')::date;

  with monthly as materialized (
    select t.id, t.description, t.kind, t.amount, t.occurred_on,
           t.created_at, t.category_id, c.name, c.description as category_description, c.color, c.icon
    from public.transactions t
    join public.categories c on c.user_id = t.user_id and c.id = t.category_id
    where t.user_id = caller_id and t.occurred_on >= p_month and t.occurred_on < next_month
  ),
  ranked as (
    select category_id as id, name, category_description, color, icon, sum(amount) as amount, count(*) as transaction_count
    from monthly where kind = 'expense'
    group by category_id, name, category_description, color, icon
    order by amount desc, name, category_id
    limit 5
  ),
  recent as (
    select * from monthly
    order by occurred_on desc, created_at desc, id desc
    limit 5
  )
  select jsonb_build_object(
    'balance', (select trunc(coalesce(sum(case when t.kind = 'income' then t.amount else -t.amount end), 0.00), 2)::text
                from public.transactions t where t.user_id = caller_id),
    'income', (select trunc(coalesce(sum(amount) filter (where kind = 'income'), 0.00), 2)::text from monthly),
    'expenses', (select trunc(coalesce(sum(amount) filter (where kind = 'expense'), 0.00), 2)::text from monthly),
    'topCategories', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'name', name, 'description', category_description, 'color', color, 'icon', icon,
        'amount', trunc(amount, 2)::text, 'transaction_count', transaction_count
      ) order by amount desc, name, id) from ranked
    ), '[]'::jsonb),
    'recentTransactions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'description', description, 'kind', kind, 'amount', trunc(amount, 2)::text,
        'occurred_on', occurred_on::text, 'created_at', created_at::text, 'category_id', category_id,
        'category', jsonb_build_object('id', category_id, 'name', name, 'description', category_description, 'color', color, 'icon', icon)
      ) order by occurred_on desc, created_at desc, id desc) from recent
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;
