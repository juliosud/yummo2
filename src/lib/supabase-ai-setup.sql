-- Supabase Setup for AI Chat SQL Query Execution
-- Run this SQL in your Supabase SQL Editor to enable the AI chat functionality

-- Create the execute_sql function that allows the AI to run dynamic queries
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS TABLE(result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Security: Only allow SELECT statements for safety
  IF NOT (query ILIKE 'SELECT%' OR query ILIKE 'WITH%') THEN
    RAISE EXCEPTION 'Only SELECT and WITH queries are allowed';
  END IF;
  
  -- Security: Prevent potentially dangerous operations
  IF query ILIKE '%DROP%' OR query ILIKE '%DELETE%' OR query ILIKE '%UPDATE%' OR query ILIKE '%INSERT%' OR query ILIKE '%ALTER%' OR query ILIKE '%CREATE%' THEN
    RAISE EXCEPTION 'Potentially dangerous operations are not allowed';
  END IF;
  
  -- Execute the query and return results as JSONB
  RETURN QUERY EXECUTE format('SELECT to_jsonb(t) FROM (%s) t', query);
EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN QUERY SELECT jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;

-- Optional: Grant execute permission to anon users if you want unauthenticated access
-- GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon;

-- Create a more flexible version that returns proper table format
CREATE OR REPLACE FUNCTION execute_sql_table(query text)
RETURNS SETOF record
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Security: Only allow SELECT statements for safety
  IF NOT (query ILIKE 'SELECT%' OR query ILIKE 'WITH%') THEN
    RAISE EXCEPTION 'Only SELECT and WITH queries are allowed';
  END IF;
  
  -- Security: Prevent potentially dangerous operations
  IF query ILIKE '%DROP%' OR query ILIKE '%DELETE%' OR query ILIKE '%UPDATE%' OR query ILIKE '%INSERT%' OR query ILIKE '%ALTER%' OR query ILIKE '%CREATE%' THEN
    RAISE EXCEPTION 'Potentially dangerous operations are not allowed';
  END IF;
  
  -- Execute the query
  RETURN QUERY EXECUTE query;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Query execution failed: %', SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION execute_sql_table(text) TO authenticated;

-- Ensure RLS policies allow access to your tables for the AI queries
-- You may need to adjust these based on your specific RLS setup

-- Example: Allow authenticated users to read all tables (adjust as needed)
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated read access" ON orders FOR SELECT TO authenticated USING (true);

-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated read access" ON order_items FOR SELECT TO authenticated USING (true);

-- ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated read access" ON menu_items FOR SELECT TO authenticated USING (true);

-- ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated read access" ON tables FOR SELECT TO authenticated USING (true);

-- ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated read access" ON table_sessions FOR SELECT TO authenticated USING (true);

-- ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow authenticated read access" ON cart_items FOR SELECT TO authenticated USING (true);

-- Test the function (you can run this to verify it works)
-- SELECT * FROM execute_sql('SELECT COUNT(*) as total_orders FROM orders');
