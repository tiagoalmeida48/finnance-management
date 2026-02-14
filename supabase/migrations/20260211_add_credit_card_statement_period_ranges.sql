create table if not exists public.credit_card_statement_period_ranges (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    card_id uuid not null references public.credit_cards(id) on delete cascade,
    period_start date not null,
    period_end date not null,
    notes text,
    created_at timestamptz not null default now(),
    constraint credit_card_statement_period_ranges_valid_dates check (period_start <= period_end)
);

create index if not exists credit_card_statement_period_ranges_card_start_idx
    on public.credit_card_statement_period_ranges(card_id, period_start);

create index if not exists credit_card_statement_period_ranges_user_card_start_idx
    on public.credit_card_statement_period_ranges(user_id, card_id, period_start);

create unique index if not exists credit_card_statement_period_ranges_card_start_uniq
    on public.credit_card_statement_period_ranges(card_id, period_start);

alter table public.credit_card_statement_period_ranges enable row level security;

create or replace function public.credit_card_statement_period_ranges_no_overlap()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    if exists (
        select 1
        from public.credit_card_statement_period_ranges existing
        where existing.card_id = new.card_id
          and existing.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
          and new.period_start <= existing.period_end
          and new.period_end >= existing.period_start
    ) then
        raise exception 'O periodo informado sobrepoe outro range de fatura ja existente para o cartao.';
    end if;

    return new;
end;
$$;

drop trigger if exists trg_credit_card_statement_period_ranges_no_overlap on public.credit_card_statement_period_ranges;
create trigger trg_credit_card_statement_period_ranges_no_overlap
before insert or update on public.credit_card_statement_period_ranges
for each row
execute function public.credit_card_statement_period_ranges_no_overlap();

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'credit_card_statement_period_ranges'
          and policyname = 'credit_card_statement_period_ranges_select_own'
    ) then
        create policy credit_card_statement_period_ranges_select_own
            on public.credit_card_statement_period_ranges
            for select
            using (user_id = auth.uid());
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'credit_card_statement_period_ranges'
          and policyname = 'credit_card_statement_period_ranges_insert_own'
    ) then
        create policy credit_card_statement_period_ranges_insert_own
            on public.credit_card_statement_period_ranges
            for insert
            with check (user_id = auth.uid());
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'credit_card_statement_period_ranges'
          and policyname = 'credit_card_statement_period_ranges_update_own'
    ) then
        create policy credit_card_statement_period_ranges_update_own
            on public.credit_card_statement_period_ranges
            for update
            using (user_id = auth.uid())
            with check (user_id = auth.uid());
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'credit_card_statement_period_ranges'
          and policyname = 'credit_card_statement_period_ranges_delete_own'
    ) then
        create policy credit_card_statement_period_ranges_delete_own
            on public.credit_card_statement_period_ranges
            for delete
            using (user_id = auth.uid());
    end if;
end
$$;

create or replace function public.create_credit_card_statement_period_range(
    p_card_id uuid,
    p_period_start date,
    p_period_end date,
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
    v_new_range public.credit_card_statement_period_ranges%rowtype;
begin
    if p_period_start is null or p_period_end is null then
        raise exception 'Periodo de abertura e fechamento e obrigatorio.';
    end if;

    if p_period_start > p_period_end then
        raise exception 'Periodo invalido: abertura nao pode ser maior que fechamento.';
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

    insert into public.credit_card_statement_period_ranges (
        user_id,
        card_id,
        period_start,
        period_end,
        notes
    )
    values (
        v_user_id,
        p_card_id,
        p_period_start,
        p_period_end,
        p_notes
    )
    returning * into v_new_range;

    return v_new_range;
end;
$$;

grant execute on function public.create_credit_card_statement_period_range(uuid, date, date, text) to authenticated;
