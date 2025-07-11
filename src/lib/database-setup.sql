-- Database setup for Restaurant QR Menu & Order System
-- Run these commands in your Supabase SQL editor

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category VARCHAR(100) NOT NULL,
  prep_time INTEGER DEFAULT 15, -- in minutes
  rating DECIMAL(3,2) DEFAULT 0.0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed')),
  total DECIMAL(10,2) NOT NULL,
  estimated_minutes INTEGER,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tables table for restaurant table management
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  seats INTEGER NOT NULL DEFAULT 4,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  x_position DECIMAL(10,2) DEFAULT 50,
  y_position DECIMAL(10,2) DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table for QR code session management
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

-- Create cart table for temporary cart items
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

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  item_name VARCHAR(255) NOT NULL, -- Store item name for historical purposes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
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

-- Clear existing menu items (optional - remove this line if you want to keep existing data)
-- DELETE FROM menu_items;

-- Insert initial menu items from the application (only if table is empty)
INSERT INTO menu_items (name, description, price, image, category, prep_time, rating, available)
SELECT * FROM (
  VALUES
  ('Pear & Orange', 'Delicious breakfast with pear and orange flavors', 25.00, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80', 'breakfast', 20, 4.8, true),
  ('Meat & Mushrooms', 'Savory dish with premium meat and wild mushrooms', 37.00, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', 'lunch', 30, 5.0, true),
  ('Egg & Bread', 'Classic breakfast with farm fresh eggs and artisan bread', 25.00, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80', 'breakfast', 10, 4.7, true),
  ('Sweet Pancake', 'Fluffy pancakes with maple syrup and fresh berries', 13.00, 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&q=80', 'breakfast', 20, 4.9, true),
  ('Shrimp Salad', 'Fresh salad with grilled shrimp and citrus dressing', 22.50, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', 'lunch', 15, 4.6, true),
  ('Fettuccine Alfredo', 'Creamy pasta with parmesan cheese and fresh herbs', 19.99, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80', 'lunch', 25, 4.8, false),
  ('Chocolate Cake', 'Rich chocolate cake with ganache frosting', 8.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', 'dessert', 10, 4.9, true),
  ('Fresh Fruit Smoothie', 'Refreshing smoothie with seasonal fruits', 7.50, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&q=80', 'drinks', 5, 4.7, true)
) AS v(name, description, price, image, category, prep_time, rating, available)
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE menu_items.name = v.name);

-- Insert initial tables (only if table is empty)
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

-- Insert some sample orders for testing (optional)
INSERT INTO orders (table_number, status, total, estimated_minutes, customer_name, notes)
SELECT * FROM (
  VALUES
  ('T01', 'preparing', 62.00, 25, 'John Doe', 'Extra sauce on the side'),
  ('T03', 'ready', 38.50, 0, 'Jane Smith', 'No onions please'),
  ('T05', 'pending', 45.99, 30, 'Mike Johnson', '')
) AS v(table_number, status, total, estimated_minutes, customer_name, notes)
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.table_number = v.table_number AND orders.customer_name = v.customer_name);

-- Get the order IDs for sample order items
DO $$
DECLARE
    order1_id UUID;
    order2_id UUID;
    order3_id UUID;
    meat_mushroom_id UUID;
    shrimp_salad_id UUID;
    pancake_id UUID;
    smoothie_id UUID;
BEGIN
    -- Get order IDs
    SELECT id INTO order1_id FROM orders WHERE table_number = 'T01' LIMIT 1;
    SELECT id INTO order2_id FROM orders WHERE table_number = 'T03' LIMIT 1;
    SELECT id INTO order3_id FROM orders WHERE table_number = 'T05' LIMIT 1;
    
    -- Get menu item IDs
    SELECT id INTO meat_mushroom_id FROM menu_items WHERE name = 'Meat & Mushrooms' LIMIT 1;
    SELECT id INTO shrimp_salad_id FROM menu_items WHERE name = 'Shrimp Salad' LIMIT 1;
    SELECT id INTO pancake_id FROM menu_items WHERE name = 'Sweet Pancake' LIMIT 1;
    SELECT id INTO smoothie_id FROM menu_items WHERE name = 'Fresh Fruit Smoothie' LIMIT 1;
    
    -- Insert order items if IDs exist and not already present
    IF order1_id IS NOT NULL AND meat_mushroom_id IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name)
        SELECT * FROM (
          VALUES
          (order1_id, meat_mushroom_id, 1, 37.00, 'Meat & Mushrooms'),
          (order1_id, pancake_id, 2, 13.00, 'Sweet Pancake')
        ) AS v(order_id, menu_item_id, quantity, price, item_name)
        WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_items.order_id = v.order_id AND order_items.menu_item_id = v.menu_item_id);
    END IF;
    
    IF order2_id IS NOT NULL AND shrimp_salad_id IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name)
        SELECT * FROM (
          VALUES
          (order2_id, shrimp_salad_id, 1, 22.50, 'Shrimp Salad'),
          (order2_id, smoothie_id, 2, 7.50, 'Fresh Fruit Smoothie')
        ) AS v(order_id, menu_item_id, quantity, price, item_name)
        WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_items.order_id = v.order_id AND order_items.menu_item_id = v.menu_item_id);
    END IF;
    
    IF order3_id IS NOT NULL AND meat_mushroom_id IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name)
        SELECT * FROM (
          VALUES
          (order3_id, meat_mushroom_id, 1, 37.00, 'Meat & Mushrooms'),
          (order3_id, smoothie_id, 1, 7.50, 'Fresh Fruit Smoothie')
        ) AS v(order_id, menu_item_id, quantity, price, item_name)
        WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_items.order_id = v.order_id AND order_items.menu_item_id = v.menu_item_id);
    END IF;
END $$;

-- Create a view for easier order management queries
CREATE OR REPLACE VIEW order_details AS
SELECT 
    o.id as order_id,
    o.table_number,
    o.status,
    o.total,
    o.estimated_minutes,
    o.customer_name,
    o.customer_phone,
    o.notes,
    o.created_at as order_created_at,
    o.updated_at as order_updated_at,
    oi.id as order_item_id,
    oi.quantity,
    oi.price as item_price,
    oi.item_name,
    mi.name as current_menu_item_name,
    mi.description,
    mi.image,
    mi.category,
    mi.prep_time
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
ORDER BY o.created_at DESC, oi.created_at ASC;

-- Grant necessary permissions (adjust based on your needs)
-- GRANT ALL ON menu_items TO anon, authenticated;
-- GRANT ALL ON orders TO anon, authenticated;
-- GRANT ALL ON order_items TO anon, authenticated;
-- GRANT SELECT ON order_details TO anon, authenticated;

-- Final verification queries (uncomment to run)
-- SELECT 'Menu Items Count:' as info, COUNT(*) as count FROM menu_items;
-- SELECT 'Orders Count:' as info, COUNT(*) as count FROM orders;
-- SELECT 'Order Items Count:' as info, COUNT(*) as count FROM order_items;
-- SELECT * FROM menu_items ORDER BY category, name;
-- SELECT * FROM order_details WHERE status != 'completed' ORDER BY order_created_at DESC;
