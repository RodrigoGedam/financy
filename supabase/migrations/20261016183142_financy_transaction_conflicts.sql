-- Comparação de snapshot sob bloqueio: impede perda de alterações concorrentes.
create function public.change_transaction(
 p_id uuid, p_expected jsonb, p_delete boolean default false,
 p_description text default null, p_kind text default null, p_amount text default null,
 p_occurred_on date default null, p_category_id uuid default null
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare current_row public.transactions;
begin
 if auth.uid() is null then raise exception using errcode='42501', message='Autenticação obrigatória.'; end if;
 select * into current_row from public.transactions where id=p_id for update;
 if not found then raise exception using errcode='P0002', message='Transação indisponível.'; end if;
 if p_expected is distinct from jsonb_build_object(
  'description', current_row.description, 'kind', current_row.kind,
  'amount', current_row.amount::text, 'occurred_on', current_row.occurred_on::text,
  'category_id', current_row.category_id::text
 ) then raise exception using errcode='P0001', message='Transação alterada.'; end if;
 if p_delete then delete from public.transactions where id=p_id;
 else perform public.save_transaction(p_description,p_kind,p_amount,p_occurred_on,p_category_id,p_id); end if;
 return p_id;
end;
$$;
revoke all on function public.change_transaction(uuid,jsonb,boolean,text,text,text,date,uuid) from public,anon,authenticated,service_role;
grant execute on function public.change_transaction(uuid,jsonb,boolean,text,text,text,date,uuid) to authenticated;
