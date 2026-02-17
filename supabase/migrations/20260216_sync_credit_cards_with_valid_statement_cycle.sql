create or replace function public.sync_credit_card_cycle_days(
    p_card_id uuid,
    p_reference_date date default current_date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_cycle record;
begin
    if p_card_id is null then
        return;
    end if;

    select c.closing_day, c.due_day
    into v_cycle
    from public.credit_card_statement_cycles c
    where c.card_id = p_card_id
      and p_reference_date between c.date_start and c.date_end
    order by c.date_start desc
    limit 1;

    if v_cycle is null then
        select c.closing_day, c.due_day
        into v_cycle
        from public.credit_card_statement_cycles c
        where c.card_id = p_card_id
          and c.date_end = '9999-12-31'
        order by c.date_start desc
        limit 1;
    end if;

    if v_cycle is null then
        select c.closing_day, c.due_day
        into v_cycle
        from public.credit_card_statement_cycles c
        where c.card_id = p_card_id
        order by c.date_start desc
        limit 1;
    end if;

    if v_cycle is null then
        return;
    end if;

    update public.credit_cards card
    set
        closing_day = v_cycle.closing_day,
        due_day = v_cycle.due_day,
        updated_at = now()
    where card.id = p_card_id
      and (
        card.closing_day is distinct from v_cycle.closing_day
        or card.due_day is distinct from v_cycle.due_day
      );
end;
$$;

create or replace function public.trg_sync_credit_card_cycle_days()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'DELETE' then
        perform public.sync_credit_card_cycle_days(old.card_id);
        return old;
    end if;

    perform public.sync_credit_card_cycle_days(new.card_id);

    if tg_op = 'UPDATE' and old.card_id is distinct from new.card_id then
        perform public.sync_credit_card_cycle_days(old.card_id);
    end if;

    return new;
end;
$$;

drop trigger if exists trg_sync_credit_card_cycle_days
on public.credit_card_statement_cycles;

create trigger trg_sync_credit_card_cycle_days
after insert or update or delete on public.credit_card_statement_cycles
for each row
execute function public.trg_sync_credit_card_cycle_days();

do $$
declare
    v_card_id uuid;
begin
    for v_card_id in
        select distinct card_id
        from public.credit_card_statement_cycles
    loop
        perform public.sync_credit_card_cycle_days(v_card_id);
    end loop;
end;
$$;
