
CREATE OR REPLACE FUNCTION public.get_enums_ddl()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $fn$
DECLARE
  result text := '';
  enum_rec record;
  labels text;
  newline text := chr(10);
  dollar text := chr(36) || chr(36);
BEGIN
  FOR enum_rec IN
    SELECT t.typname
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public' AND t.typtype = 'e'
    ORDER BY t.typname
  LOOP
    SELECT string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder)
    INTO labels
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = enum_rec.typname;

    result := result || 'DO ' || dollar || ' BEGIN' || newline
      || '  CREATE TYPE public.' || quote_ident(enum_rec.typname) 
      || ' AS ENUM (' || labels || ');' || newline
      || 'EXCEPTION WHEN duplicate_object THEN NULL; END ' || dollar || ';' || newline || newline;
  END LOOP;

  RETURN result;
END;
$fn$;

GRANT EXECUTE ON FUNCTION public.get_enums_ddl() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_enums_ddl() TO anon;
