create table if not exists public.credit_card_statement_cycles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    card_id uuid not null references public.credit_cards(id) on delete cascade,
    date_start date not null,
    date_end date not null default '9999-12-31',
    closing_day smallint not null,
    due_day smallint not null,
    notes text,
    created_at timestamptz not null default now(),
    constraint credit_card_statement_cycles_valid_days check (closing_day between 1 and 31 and due_day between 1 and 31),
    constraint credit_card_statement_cycles_valid_dates check (date_start <= date_end)
);

create index if not exists credit_card_statement_cycles_card_start_idx
    on public.credit_card_statement_cycles(card_id, date_start);

create index if not exists credit_card_statement_cycles_user_card_start_idx
    on public.credit_card_statement_cycles(user_id, card_id, date_start);

create unique index if not exists credit_card_statement_cycles_card_start_uniq
    on public.credit_card_statement_cycles(card_id, date_start);

alter table public.credit_card_statement_cycles enable row level security;

create or replace function public.credit_card_statement_cycles_no_overlap()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if exists (
        select 1
        from public.credit_card_statement_cycles existing
        where existing.card_id = new.card_id
          and existing.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
          and new.date_start <= existing.date_end
          and new.date_end >= existing.date_start
    ) then
        raise exception 'A vigencia informada sobrepoe outro periodo ja existente para o cartao.';
    end if;

    return new;
end;
$$;

drop trigger if exists trg_credit_card_statement_cycles_no_overlap on public.credit_card_statement_cycles;
create trigger trg_credit_card_statement_cycles_no_overlap
before insert or update on public.credit_card_statement_cycles
for each row
execute function public.credit_card_statement_cycles_no_overlap();

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'credit_card_statement_cycles'
          and policyname = 'credit_card_statement_cycles_select_own'
    ) then
        create policy credit_card_statement_cycles_select_own
            on public.credit_card_statement_cycles
            for select
            using (user_id = auth.uid());
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'credit_card_statement_cycles'
          and policyname = 'credit_card_statement_cycles_insert_own'
    ) then
        create policy credit_card_statement_cycles_insert_own
            on public.credit_card_statement_cycles
            for insert
            with check (user_id = auth.uid());
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'credit_card_statement_cycles'
          and policyname = 'credit_card_statement_cycles_update_own'
    ) then
        create policy credit_card_statement_cycles_update_own
            on public.credit_card_statement_cycles
            for update
            using (user_id = auth.uid())
            with check (user_id = auth.uid());
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'credit_card_statement_cycles'
          and policyname = 'credit_card_statement_cycles_delete_own'
    ) then
        create policy credit_card_statement_cycles_delete_own
            on public.credit_card_statement_cycles
            for delete
            using (user_id = auth.uid());
    end if;
end
$$;

insert into public.credit_card_statement_cycles (
    user_id,
    card_id,
    date_start,
    date_end,
    closing_day,
    due_day,
    notes
)
select
    c.user_id,
    c.id,
    coalesce(
        (
            select min(coalesce(t.purchase_date, t.payment_date))
            from public.transactions t
            where t.card_id = c.id
        ),
        (c.created_at at time zone 'UTC')::date
    ) as date_start,
    '9999-12-31'::date as date_end,
    c.closing_day,
    c.due_day,
    'Vigencia inicial criada por migracao.'
from public.credit_cards c
where not exists (
    select 1
    from public.credit_card_statement_cycles cycles
    where cycles.card_id = c.id
);

create or replace function public.create_credit_card_statement_cycle(
    p_card_id uuid,
    p_date_start date,
    p_closing_day integer,
    p_due_day integer,
    p_notes text default null
)
returns public.credit_card_statement_cycles
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_user_id uuid;
    v_card record;
    v_target_cycle public.credit_card_statement_cycles%rowtype;
    v_new_cycle public.credit_card_statement_cycles%rowtype;
    v_new_previous_end date;
begin
    if p_date_start is null then
        raise exception 'Data de inicio obrigatoria.';
    end if;

    if p_closing_day is null or p_closing_day < 1 or p_closing_day > 31 then
        raise exception 'Dia de fechamento invalido.';
    end if;

    if p_due_day is null or p_due_day < 1 or p_due_day > 31 then
        raise exception 'Dia de vencimento invalido.';
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
    into v_target_cycle
    from public.credit_card_statement_cycles c
    where c.card_id = p_card_id
      and p_date_start between c.date_start and c.date_end
    order by c.date_start desc
    limit 1;

    if v_target_cycle is null then
        raise exception 'Nao existe vigencia que contenha a data informada.';
    end if;

    if p_date_start <= v_target_cycle.date_start then
        raise exception 'A data de inicio deve ser maior que %.', v_target_cycle.date_start;
    end if;

    v_new_previous_end := p_date_start - 1;

    if v_new_previous_end < v_target_cycle.date_start then
        raise exception 'Nao foi possivel dividir a vigencia atual com a data informada.';
    end if;

    update public.credit_card_statement_cycles
    set date_end = v_new_previous_end
    where id = v_target_cycle.id;

    insert into public.credit_card_statement_cycles (
        user_id,
        card_id,
        date_start,
        date_end,
        closing_day,
        due_day,
        notes
    )
    values (
        v_user_id,
        p_card_id,
        p_date_start,
        v_target_cycle.date_end,
        p_closing_day,
        p_due_day,
        p_notes
    )
    returning * into v_new_cycle;

    return v_new_cycle;
end;
$$;

grant execute on function public.create_credit_card_statement_cycle(uuid, date, integer, integer, text) to authenticated;
