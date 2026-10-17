-- Agregação autorizada no banco, sem depender do limite de linhas da Data API.
create function public.get_dashboard(p_month date)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
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
           t.created_at, t.category_id, c.name, c.color, c.icon
    from public.transactions t
    join public.categories c on c.user_id = t.user_id and c.id = t.category_id
    where t.user_id = caller_id and t.occurred_on >= p_month and t.occurred_on < next_month
  ),
  ranked as (
    select category_id as id, name, color, icon, sum(amount) as amount, count(*) as transaction_count
    from monthly where kind = 'expense'
    group by category_id, name, color, icon
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
        'id', id, 'name', name, 'color', color, 'icon', icon,
        'amount', trunc(amount, 2)::text, 'transaction_count', transaction_count
      ) order by amount desc, name, id) from ranked
    ), '[]'::jsonb),
    'recentTransactions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', id, 'description', description, 'kind', kind, 'amount', trunc(amount, 2)::text,
        'occurred_on', occurred_on::text, 'created_at', created_at::text, 'category_id', category_id,
        'category', jsonb_build_object('id', category_id, 'name', name, 'color', color, 'icon', icon)
      ) order by occurred_on desc, created_at desc, id desc) from recent
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

revoke all on function public.get_dashboard(date) from public, anon, authenticated, service_role;
grant execute on function public.get_dashboard(date) to authenticated;
