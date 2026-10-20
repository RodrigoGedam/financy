-- Expansão compatível: nenhuma reescrita de títulos legados.
create or replace function private.prepare_financial_row()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  -- Mesmo conjunto de espaços externos de String.prototype.trim (ECMAScript).
  trim_chars constant text := U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF';
begin
  if tg_op = 'UPDATE' and (new.id is distinct from old.id or new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at) then
    raise exception using errcode = '23514', message = 'Identidade, dono e criação são imutáveis.';
  end if;
  if tg_table_name = 'categories' then
    new.name := btrim(new.name, trim_chars);
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

alter table public.categories add constraint categories_name_length_check
  check (char_length(name) between 1 and 20) not valid;
alter table public.transactions add constraint transactions_description_length_check
  check (char_length(description) between 1 and 20) not valid;

-- Validar somente quando toda a história já satisfaz o CHECK; nunca corrigir dados aqui.
do $$
begin
  if not exists (select 1 from public.categories where char_length(name) not between 1 and 20) then
    alter table public.categories validate constraint categories_name_length_check;
  end if;
  if not exists (select 1 from public.transactions where char_length(description) not between 1 and 20) then
    alter table public.transactions validate constraint transactions_description_length_check;
  end if;
end;
$$;
