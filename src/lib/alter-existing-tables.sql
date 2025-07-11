-- ALTER TABLE script for existing Restaurant QR Menu & Order System tables
-- Run these commands in your Supabase SQL editor to modify existing tables

-- First, let's safely add missing columns to existing tables

-- 1. ALTER menu_items table - add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add prep_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'prep_time') THEN
        ALTER TABLE menu_items ADD COLUMN prep_time INTEGER DEFAULT 15;
    END IF;
    
    -- Add rating column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'rating') THEN
        ALTER TABLE menu_items ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.0;
    END IF;
    
    -- Add available column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'available') THEN
        ALTER TABLE menu_items ADD COLUMN available BOOLEAN DEFAULT true;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'created_at') THEN
        ALTER TABLE menu_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'updated_at') THEN
        ALTER TABLE menu_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. ALTER orders table - add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add estimated_minutes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'estimated_minutes') THEN
        ALTER TABLE orders ADD COLUMN estimated_minutes INTEGER;
    END IF;
    
    -- Add customer_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);
    END IF;
    
    -- Add customer_phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_phone') THEN
        ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20);
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_at') THEN
        ALTER TABLE orders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 3. ALTER tables table - add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add table_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'table_id') THEN
        ALTER TABLE tables ADD COLUMN table_id VARCHAR(10);
        -- Update existing records with a default table_id based on their id or name
        UPDATE tables SET table_id = COALESCE(name, id::text) WHERE table_id IS NULL;
        -- Make it NOT NULL and UNIQUE after populating
        ALTER TABLE tables ALTER COLUMN table_id SET NOT NULL;
        ALTER TABLE tables ADD CONSTRAINT tables_table_id_unique UNIQUE (table_id);
    END IF;
    
    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'name') THEN
        ALTER TABLE tables ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT 'Table';
    END IF;
    
    -- Add seats column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'seats') THEN
        ALTER TABLE tables ADD COLUMN seats INTEGER NOT NULL DEFAULT 4;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'status') THEN
        ALTER TABLE tables ADD COLUMN status VARCHAR(20) DEFAULT 'available';
        -- Add check constraint
        ALTER TABLE tables ADD CONSTRAINT tables_status_check CHECK (status IN ('available', 'occupied', 'reserved'));
    END IF;
    
    -- Add x_position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'x_position') THEN
        ALTER TABLE tables ADD COLUMN x_position DECIMAL(10,2) DEFAULT 50;
    END IF;
    
    -- Add y_position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'y_position') THEN
        ALTER TABLE tables ADD COLUMN y_position DECIMAL(10,2) DEFAULT 50;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'created_at') THEN
        ALTER TABLE tables ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tables' AND column_name = 'updated_at') THEN
        ALTER TABLE tables ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Create table_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS table_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id VARCHAR(10) NOT NULL,
  session_code VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  qr_code_data TEXT,
  menu_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL, -- Table number + session identifier
  table_number VARCHAR(10) NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ALTER order_items table - add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add item_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'item_name') THEN
        ALTER TABLE order_items ADD COLUMN item_name VARCHAR(255);
        -- Update existing records with menu item names
        UPDATE order_items SET item_name = mi.name 
        FROM menu_items mi 
        WHERE order_items.menu_item_id = mi.id AND order_items.item_name IS NULL;
        -- Make it NOT NULL after populating
        ALTER TABLE order_items ALTER COLUMN item_name SET NOT NULL;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'created_at') THEN
        ALTER TABLE order_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 7. Update data types and constraints if needed
DO $$ 
BEGIN
    -- Ensure orders.status has the correct check constraint
    BEGIN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
        ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'preparing', 'ready', 'completed'));
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, that's okay
        NULL;
    END;
    
    -- Ensure tables.status has the correct check constraint
    BEGIN
        ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_status_check;
        ALTER TABLE tables ADD CONSTRAINT tables_status_check CHECK (status IN ('available', 'occupied', 'reserved'));
    EXCEPTION WHEN OTHERS THEN
        -- Constraint might not exist, that's okay
        NULL;
    END;
END $$;

-- 8. Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_table_number ON cart_items(table_number);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_tables_table_id ON tables(table_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_table_sessions_table_id ON table_sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_session_code ON table_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_table_sessions_is_active ON table_sessions(is_active);

-- 9. Enable Row Level Security (RLS) if not already enabled
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;

-- 10. Create or update RLS policies
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public insert access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public update access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public delete access to menu_items" ON menu_items;

DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public update access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public delete access to orders" ON orders;

DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public insert access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public update access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public delete access to order_items" ON order_items;

DROP POLICY IF EXISTS "Allow public read access to cart_items" ON cart_items;
DROP POLICY IF EXISTS "Allow public insert access to cart_items" ON cart_items;
DROP POLICY IF EXISTS "Allow public update access to cart_items" ON cart_items;
DROP POLICY IF EXISTS "Allow public delete access to cart_items" ON cart_items;

DROP POLICY IF EXISTS "Allow public read access to tables" ON tables;
DROP POLICY IF EXISTS "Allow public insert access to tables" ON tables;
DROP POLICY IF EXISTS "Allow public update access to tables" ON tables;
DROP POLICY IF EXISTS "Allow public delete access to tables" ON tables;

DROP POLICY IF EXISTS "Allow public read access to table_sessions" ON table_sessions;
DROP POLICY IF EXISTS "Allow public insert access to table_sessions" ON table_sessions;
DROP POLICY IF EXISTS "Allow public update access to table_sessions" ON table_sessions;
DROP POLICY IF EXISTS "Allow public delete access to table_sessions" ON table_sessions;

-- Create new policies
-- Menu items policies
CREATE POLICY "Allow public read access to menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to menu_items" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to menu_items" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to menu_items" ON menu_items FOR DELETE USING (true);

-- Orders policies
CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to orders" ON orders FOR DELETE USING (true);

-- Order items policies
CREATE POLICY "Allow public read access to order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to order_items" ON order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to order_items" ON order_items FOR DELETE USING (true);

-- Cart items policies
CREATE POLICY "Allow public read access to cart_items" ON cart_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to cart_items" ON cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to cart_items" ON cart_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to cart_items" ON cart_items FOR DELETE USING (true);

-- Tables policies
CREATE POLICY "Allow public read access to tables" ON tables FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to tables" ON tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to tables" ON tables FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to tables" ON tables FOR DELETE USING (true);

-- Table sessions policies
CREATE POLICY "Allow public read access to table_sessions" ON table_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to table_sessions" ON table_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to table_sessions" ON table_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to table_sessions" ON table_sessions FOR DELETE USING (true);

-- 11. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tables_updated_at ON tables;
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_table_sessions_updated_at ON table_sessions;
CREATE TRIGGER update_table_sessions_updated_at BEFORE UPDATE ON table_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Insert initial tables if none exist
INSERT INTO tables (table_id, name, seats, status, x_position, y_position)
SELECT * FROM (
  VALUES
  ('1', 'Table 1', 4, 'available', 50, 50),
  ('2', 'Table 2', 2, 'available', 200, 50),
  ('3', 'Table 3', 6, 'available', 350, 50),
  ('4', 'Table 4', 4, 'available', 50, 200),
  ('5', 'Table 5', 8, 'available', 200, 200)
) AS v(table_id, name, seats, status, x_position, y_position)
WHERE NOT EXISTS (SELECT 1 FROM tables WHERE tables.table_id = v.table_id);

-- 14. Update existing menu items with default values for new columns
UPDATE menu_items SET 
    prep_time = COALESCE(prep_time, 15),
    rating = COALESCE(rating, 4.5),
    available = COALESCE(available, true),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE prep_time IS NULL OR rating IS NULL OR available IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- 15. Update existing orders with default values for new columns
UPDATE orders SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

-- 16. Update existing tables with default values for new columns
UPDATE tables SET 
    seats = COALESCE(seats, 4),
    status = COALESCE(status, 'available'),
    x_position = COALESCE(x_position, 50),
    y_position = COALESCE(y_position, 50),
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE seats IS NULL OR status IS NULL OR x_position IS NULL OR y_position IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- 17. Final verification queries (uncomment to run)
-- SELECT 'Menu Items Count:' as info, COUNT(*) as count FROM menu_items;
-- SELECT 'Orders Count:' as info, COUNT(*) as count FROM orders;
-- SELECT 'Order Items Count:' as info, COUNT(*) as count FROM order_items;
-- SELECT 'Tables Count:' as info, COUNT(*) as count FROM tables;
-- SELECT 'Table Sessions Count:' as info, COUNT(*) as count FROM table_sessions;
-- SELECT 'Cart Items Count:' as info, COUNT(*) as count FROM cart_items;

-- Show table structures
-- SELECT table_name, column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name IN ('menu_items', 'orders', 'order_items', 'tables', 'table_sessions', 'cart_items')
-- ORDER BY table_name, ordinal_position;
