CREATE OR REPLACE FUNCTION public.get_profile()
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_row public.profiles;
BEGIN
  SELECT * INTO v_row FROM public.profiles WHERE id = auth.uid();
  RETURN v_row;
END;
$$;
