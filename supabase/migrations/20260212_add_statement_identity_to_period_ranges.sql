alter table public.credit_card_statement_period_ranges
    add column if not exists statement_month_key text;

alter table public.credit_card_statement_period_ranges
    add column if not exists statement_name text;

update public.credit_card_statement_period_ranges
set
    statement_month_key = coalesce(statement_month_key, to_char(period_end, 'YYYY-MM')),
    statement_name = coalesce(statement_name, to_char(period_end, 'YYYY-MM'))
where statement_month_key is null
   or statement_name is null;

alter table public.credit_card_statement_period_ranges
    alter column statement_month_key set not null;

alter table public.credit_card_statement_period_ranges
    alter column statement_name set not null;

create unique index if not exists credit_card_statement_period_ranges_card_month_key_uniq
    on public.credit_card_statement_period_ranges(card_id, statement_month_key);

drop function if exists public.create_credit_card_statement_period_range(uuid, date, date, text);
drop function if exists public.create_credit_card_statement_period_range(uuid, date, date, text, text, text);

create or replace function public.create_credit_card_statement_period_range(
    p_card_id uuid,
    p_period_start date,
    p_period_end date,
    p_statement_month_key text,
    p_statement_name text,
    p_notes text default null
)
returns public.credit_card_statement_period_ranges
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_user_id uuid;
    v_card record;
    v_existing_range public.credit_card_statement_period_ranges%rowtype;
    v_new_range public.credit_card_statement_period_ranges%rowtype;
begin
    if p_period_start is null or p_period_end is null then
        raise exception 'Periodo de abertura e fechamento e obrigatorio.';
    end if;

    if p_period_start > p_period_end then
        raise exception 'Periodo invalido: abertura nao pode ser maior que fechamento.';
    end if;

    if p_statement_month_key is null or p_statement_month_key !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
        raise exception 'Chave da fatura invalida. Use o formato YYYY-MM.';
    end if;

    if p_statement_name is null or btrim(p_statement_name) = '' then
        raise exception 'Nome da fatura obrigatorio.';
    end if;

    select auth.uid() into v_user_id;
    if v_user_id is null then
        raise exception 'Not authenticated';
    end if;

    select c.id, c.user_id
    into v_card
    from public.credit_cards c
    where c.id = p_card_id
      and c.user_id = v_user_id
      and c.deleted_at is null
    limit 1;

    if v_card is null then
        raise exception 'Cartao invalido ou sem permissao.';
    end if;

    select *
    into v_existing_range
    from public.credit_card_statement_period_ranges ranges
    where ranges.card_id = p_card_id
      and ranges.statement_month_key = p_statement_month_key
    limit 1;

    if v_existing_range is null then
        insert into public.credit_card_statement_period_ranges (
            user_id,
            card_id,
            period_start,
            period_end,
            statement_month_key,
            statement_name,
            notes
        )
        values (
            v_user_id,
            p_card_id,
            p_period_start,
            p_period_end,
            p_statement_month_key,
            btrim(p_statement_name),
            p_notes
        )
        returning * into v_new_range;
    else
        update public.credit_card_statement_period_ranges
        set
            period_start = p_period_start,
            period_end = p_period_end,
            statement_name = btrim(p_statement_name),
            notes = p_notes
        where id = v_existing_range.id
        returning * into v_new_range;
    end if;

    return v_new_range;
end;
$$;

grant execute on function public.create_credit_card_statement_period_range(uuid, date, date, text, text, text) to authenticated;
