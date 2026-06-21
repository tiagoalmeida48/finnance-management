-- =============================================================================
-- Admin RPCs — versionamento local (existiam apenas no Supabase)
-- Todas validam is_current_user_admin() antes de executar.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(id uuid, email text, full_name text, is_admin boolean, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
    if not public.is_current_user_admin() then
        raise exception 'Access denied';
    end if;

    return query
    select
        u.id,
        u.email::text,
        p.full_name::text,
        coalesce(p.is_admin, false) as is_admin,
        u.created_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at desc;
end;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_user(
    p_email text,
    p_password text,
    p_full_name text DEFAULT NULL,
    p_is_admin boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
    v_user_id uuid := gen_random_uuid();
    v_instance_id uuid := '00000000-0000-0000-0000-000000000000';
begin
    if not public.is_current_user_admin() then
        raise exception 'Access denied';
    end if;

    if p_email is null or length(trim(p_email)) = 0 then
        raise exception 'Email is required';
    end if;

    if p_password is null or length(p_password) < 6 then
        raise exception 'Password must be at least 6 characters';
    end if;

    select u.instance_id into v_instance_id from auth.users u limit 1;

    if exists (
        select 1 from auth.users u where lower(u.email) = lower(trim(p_email))
    ) then
        raise exception 'Email already exists';
    end if;

    insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, confirmation_sent_at, recovery_sent_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) values (
        v_instance_id, v_user_id, 'authenticated', 'authenticated',
        trim(lower(p_email)),
        extensions.crypt(p_password, extensions.gen_salt('bf')),
        now(), now(), null,
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object('full_name', coalesce(p_full_name, '')),
        now(), now()
    );

    insert into auth.identities (
        id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at
    ) values (
        gen_random_uuid(), v_user_id,
        jsonb_build_object(
            'sub', v_user_id::text, 'email', trim(lower(p_email)),
            'email_verified', true, 'phone_verified', false
        ),
        'email', trim(lower(p_email)), now(), now(), now()
    );

    insert into public.profiles (id, full_name, is_admin, updated_at)
    values (v_user_id, p_full_name, coalesce(p_is_admin, false), now())
    on conflict (id) do update
        set full_name = excluded.full_name,
            is_admin  = excluded.is_admin,
            updated_at = now();

    return v_user_id;
end;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_user(
    p_user_id uuid,
    p_email text,
    p_full_name text DEFAULT NULL,
    p_is_admin boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
    if not public.is_current_user_admin() then
        raise exception 'Access denied';
    end if;

    if p_user_id is null then
        raise exception 'User id is required';
    end if;

    if p_email is null or length(trim(p_email)) = 0 then
        raise exception 'Email is required';
    end if;

    update auth.users
       set email = trim(lower(p_email)), updated_at = now()
     where id = p_user_id;

    if not found then
        raise exception 'User not found';
    end if;

    update auth.identities
       set provider_id = trim(lower(p_email)),
           identity_data = jsonb_set(
               jsonb_set(coalesce(identity_data, '{}'::jsonb), '{email}', to_jsonb(trim(lower(p_email)))),
               '{email_verified}', 'true'::jsonb
           ),
           updated_at = now()
     where user_id = p_user_id and provider = 'email';

    insert into public.profiles (id, full_name, is_admin, updated_at)
    values (p_user_id, p_full_name, coalesce(p_is_admin, false), now())
    on conflict (id) do update
        set full_name  = excluded.full_name,
            is_admin   = excluded.is_admin,
            updated_at = now();
end;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_user_password(p_user_id uuid, p_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
    if not public.is_current_user_admin() then
        raise exception 'Access denied';
    end if;

    if p_password is null or length(p_password) < 6 then
        raise exception 'Password must be at least 6 characters';
    end if;

    update auth.users
       set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
           updated_at = now()
     where id = p_user_id;

    if not found then
        raise exception 'User not found';
    end if;
end;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
    if not public.is_current_user_admin() then
        raise exception 'Access denied';
    end if;

    if p_user_id = auth.uid() then
        raise exception 'You cannot delete your own user';
    end if;

    delete from auth.users where id = p_user_id;

    if not found then
        raise exception 'User not found';
    end if;
end;
$$;
