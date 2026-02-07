
-- Drop and recreate with proper permissions
DROP FUNCTION IF EXISTS public.get_table_ddl(text);

CREATE OR REPLACE FUNCTION public.get_table_ddl(_table_name text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, information_schema, pg_catalog
AS $$
DECLARE
  ddl text;
  col record;
  pk_cols text[];
  fk record;
  newline text := chr(10);
  has_rls boolean;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = _table_name
  ) THEN
    RETURN '-- Table not found: ' || _table_name;
  END IF;

  ddl := 'CREATE TABLE public.' || quote_ident(_table_name) || ' (' || newline;

  FOR col IN
    SELECT 
      c.column_name,
      c.data_type,
      c.udt_name,
      c.character_maximum_length,
      c.numeric_precision,
      c.numeric_scale,
      c.is_nullable,
      c.column_default
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = _table_name
    ORDER BY c.ordinal_position
  LOOP
    ddl := ddl || '  ' || quote_ident(col.column_name) || ' ';
    
    IF col.data_type = 'ARRAY' THEN
      ddl := ddl || col.udt_name;
    ELSIF col.data_type = 'USER-DEFINED' THEN
      ddl := ddl || col.udt_name;
    ELSIF col.data_type = 'character varying' AND col.character_maximum_length IS NOT NULL THEN
      ddl := ddl || 'varchar(' || col.character_maximum_length || ')';
    ELSIF col.data_type = 'numeric' AND col.numeric_precision IS NOT NULL THEN
      ddl := ddl || 'numeric(' || col.numeric_precision || ',' || COALESCE(col.numeric_scale, 0) || ')';
    ELSE
      ddl := ddl || col.data_type;
    END IF;

    IF col.is_nullable = 'NO' THEN
      ddl := ddl || ' NOT NULL';
    END IF;

    IF col.column_default IS NOT NULL THEN
      ddl := ddl || ' DEFAULT ' || col.column_default;
    END IF;

    ddl := ddl || ',' || newline;
  END LOOP;

  SELECT array_agg(kcu.column_name ORDER BY kcu.ordinal_position)
  INTO pk_cols
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public' 
    AND tc.table_name = _table_name 
    AND tc.constraint_type = 'PRIMARY KEY';

  IF pk_cols IS NOT NULL THEN
    ddl := ddl || '  PRIMARY KEY (' || array_to_string(pk_cols, ', ') || ')';
  ELSE
    ddl := rtrim(ddl, ',' || newline);
  END IF;

  ddl := ddl || newline || ');' || newline || newline;

  FOR fk IN
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = _table_name
      AND tc.constraint_type = 'FOREIGN KEY'
  LOOP
    ddl := ddl || 'ALTER TABLE public.' || quote_ident(_table_name) 
      || ' ADD CONSTRAINT ' || quote_ident(fk.constraint_name)
      || ' FOREIGN KEY (' || quote_ident(fk.column_name) || ')'
      || ' REFERENCES ' || quote_ident(fk.foreign_table_schema) || '.' || quote_ident(fk.foreign_table_name) 
      || '(' || quote_ident(fk.foreign_column_name) || ');' || newline;
  END LOOP;

  SELECT rowsecurity INTO has_rls
  FROM pg_catalog.pg_tables 
  WHERE schemaname = 'public' AND tablename = _table_name;

  IF has_rls THEN
    ddl := ddl || newline || 'ALTER TABLE public.' || quote_ident(_table_name) || ' ENABLE ROW LEVEL SECURITY;' || newline;
  END IF;

  RETURN ddl;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_table_ddl(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_ddl(text) TO anon;
