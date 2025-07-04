-- Simple database population script for Restaurant QR Menu & Order System
-- Run this in your Supabase SQL editor to populate tables with sample data

-- Clear existing data (optional - uncomment if you want to start fresh)
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM menu_items;

-- Insert menu items
INSERT INTO menu_items (name, description, price, image, category, prep_time, rating, available) VALUES
('Pear & Orange', 'Delicious breakfast with pear and orange flavors', 25.00, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80', 'breakfast', 20, 4.8, true),
('Meat & Mushrooms', 'Savory dish with premium meat and wild mushrooms', 37.00, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', 'lunch', 30, 5.0, true),
('Egg & Bread', 'Classic breakfast with farm fresh eggs and artisan bread', 25.00, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80', 'breakfast', 10, 4.7, true),
('Sweet Pancake', 'Fluffy pancakes with maple syrup and fresh berries', 13.00, 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&q=80', 'breakfast', 20, 4.9, true),
('Shrimp Salad', 'Fresh salad with grilled shrimp and citrus dressing', 22.50, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', 'lunch', 15, 4.6, true),
('Fettuccine Alfredo', 'Creamy pasta with parmesan cheese and fresh herbs', 19.99, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80', 'lunch', 25, 4.8, false),
('Chocolate Cake', 'Rich chocolate cake with ganache frosting', 8.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', 'dessert', 10, 4.9, true),
('Fresh Fruit Smoothie', 'Refreshing smoothie with seasonal fruits', 7.50, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&q=80', 'drinks', 5, 4.7, true),
('Avocado Toast', 'Sourdough toast topped with smashed avocado, cherry tomatoes, and feta', 16.00, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&q=80', 'breakfast', 8, 4.6, true),
('French Toast', 'Thick-cut brioche French toast with cinnamon and vanilla', 18.00, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80', 'breakfast', 15, 4.8, true),
('Breakfast Burrito', 'Scrambled eggs, bacon, cheese, and hash browns wrapped in a flour tortilla', 14.50, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', 'breakfast', 12, 4.5, true),
('Grilled Chicken Sandwich', 'Juicy grilled chicken breast with lettuce, tomato, and mayo on brioche', 19.00, 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&q=80', 'lunch', 18, 4.7, true),
('Caesar Salad', 'Crisp romaine lettuce with parmesan, croutons, and Caesar dressing', 16.50, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&q=80', 'lunch', 10, 4.4, true),
('Fish Tacos', 'Grilled fish with cabbage slaw and chipotle mayo in corn tortillas', 21.00, 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400&q=80', 'lunch', 20, 4.8, true),
('Beef Burger', 'Angus beef patty with cheese, lettuce, tomato, and special sauce', 24.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', 'lunch', 25, 4.9, true),
('Pasta Carbonara', 'Creamy pasta with bacon, eggs, parmesan, and black pepper', 26.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&q=80', 'lunch', 22, 4.7, true),
('Margherita Pizza', 'Classic pizza with fresh mozzarella, tomatoes, and basil', 28.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80', 'lunch', 35, 4.6, true),
('Grilled Salmon', 'Atlantic salmon with lemon herb butter and seasonal vegetables', 32.00, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80', 'dinner', 25, 4.8, true),
('Ribeye Steak', '12oz ribeye steak with garlic mashed potatoes and asparagus', 45.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80', 'dinner', 40, 4.9, true),
('Lobster Risotto', 'Creamy arborio rice with fresh lobster and white wine', 38.00, 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&q=80', 'dinner', 35, 4.7, true),
('Lamb Chops', 'Herb-crusted lamb chops with rosemary jus and roasted vegetables', 42.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', 'dinner', 30, 4.8, true),
('Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone', 9.50, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80', 'dessert', 5, 4.8, true),
('Crème Brûlée', 'Vanilla custard with caramelized sugar crust', 10.00, 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=400&q=80', 'dessert', 8, 4.7, true),
('Cheesecake', 'New York style cheesecake with berry compote', 9.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80', 'dessert', 5, 4.6, true),
('Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce, whipped cream, and cherry', 7.50, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', 'dessert', 3, 4.5, true),
('Craft Beer', 'Local IPA with citrus and pine notes', 6.00, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&q=80', 'drinks', 2, 4.4, true),
('House Wine', 'Cabernet Sauvignon from local vineyard', 8.00, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', 'drinks', 2, 4.3, true),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 5.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80', 'drinks', 3, 4.6, true),
('Espresso', 'Rich, bold espresso shot', 3.50, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80', 'drinks', 2, 4.8, true),
('Iced Tea', 'Refreshing iced tea with lemon', 4.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', 'drinks', 3, 4.2, true);

-- Insert sample orders
INSERT INTO orders (table_number, status, total, estimated_minutes, customer_name, notes) VALUES
('A4', 'preparing', 87.34, 25, 'Ariel Hikmat', 'Extra sauce on the side'),
('B2', 'pending', 57.87, 30, 'Denis Freeman', 'No onions please'),
('TA', 'ready', 86.96, 0, 'Morgan Cox', 'Takeaway order'),
('A9', 'completed', 98.34, 0, 'Maja Becker', 'Dine in'),
('C2', 'completed', 56.96, 0, 'Erwan Richard', 'Extra napkins');

-- Insert order items (using a simpler approach)
DO $$
DECLARE
    order_a4 UUID;
    order_b2 UUID;
    order_ta UUID;
    order_a9 UUID;
    order_c2 UUID;
    
    pancake_id UUID;
    salmon_id UUID;
    burger_id UUID;
    cake_id UUID;
    smoothie_id UUID;
    meat_mushroom_id UUID;
    shrimp_salad_id UUID;
BEGIN
    -- Get order IDs
    SELECT id INTO order_a4 FROM orders WHERE table_number = 'A4' AND customer_name = 'Ariel Hikmat';
    SELECT id INTO order_b2 FROM orders WHERE table_number = 'B2' AND customer_name = 'Denis Freeman';
    SELECT id INTO order_ta FROM orders WHERE table_number = 'TA' AND customer_name = 'Morgan Cox';
    SELECT id INTO order_a9 FROM orders WHERE table_number = 'A9' AND customer_name = 'Maja Becker';
    SELECT id INTO order_c2 FROM orders WHERE table_number = 'C2' AND customer_name = 'Erwan Richard';
    
    -- Get menu item IDs
    SELECT id INTO pancake_id FROM menu_items WHERE name = 'Sweet Pancake';
    SELECT id INTO salmon_id FROM menu_items WHERE name = 'Grilled Salmon';
    SELECT id INTO burger_id FROM menu_items WHERE name = 'Beef Burger';
    SELECT id INTO cake_id FROM menu_items WHERE name = 'Chocolate Cake';
    SELECT id INTO smoothie_id FROM menu_items WHERE name = 'Fresh Fruit Smoothie';
    SELECT id INTO meat_mushroom_id FROM menu_items WHERE name = 'Meat & Mushrooms';
    SELECT id INTO shrimp_salad_id FROM menu_items WHERE name = 'Shrimp Salad';
    
    -- Insert order items for order A4
    IF order_a4 IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name) VALUES
        (order_a4, pancake_id, 2, 13.00, 'Sweet Pancake'),
        (order_a4, salmon_id, 1, 32.00, 'Grilled Salmon'),
        (order_a4, smoothie_id, 2, 7.50, 'Fresh Fruit Smoothie');
    END IF;
    
    -- Insert order items for order B2
    IF order_b2 IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name) VALUES
        (order_b2, burger_id, 1, 24.00, 'Beef Burger'),
        (order_b2, shrimp_salad_id, 1, 22.50, 'Shrimp Salad');
    END IF;
    
    -- Insert order items for order TA
    IF order_ta IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name) VALUES
        (order_ta, meat_mushroom_id, 1, 37.00, 'Meat & Mushrooms'),
        (order_ta, pancake_id, 2, 13.00, 'Sweet Pancake'),
        (order_ta, cake_id, 1, 8.99, 'Chocolate Cake');
    END IF;
    
    -- Insert order items for order A9
    IF order_a9 IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name) VALUES
        (order_a9, salmon_id, 2, 32.00, 'Grilled Salmon'),
        (order_a9, smoothie_id, 1, 7.50, 'Fresh Fruit Smoothie');
    END IF;
    
    -- Insert order items for order C2
    IF order_c2 IS NOT NULL THEN
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name) VALUES
        (order_c2, burger_id, 1, 24.00, 'Beef Burger'),
        (order_c2, cake_id, 2, 8.99, 'Chocolate Cake');
    END IF;
END $$;

-- Verify the data was inserted
SELECT 'Menu Items' as table_name, COUNT(*) as count FROM menu_items
UNION ALL
SELECT 'Orders' as table_name, COUNT(*) as count FROM orders
UNION ALL
SELECT 'Order Items' as table_name, COUNT(*) as count FROM order_items;

-- Show sample data
SELECT 'Sample Menu Items:' as info;
SELECT name, category, price, available FROM menu_items ORDER BY category, name LIMIT 10;

SELECT 'Sample Orders:' as info;
SELECT table_number, customer_name, status, total FROM orders ORDER BY created_at DESC;

SELECT 'Sample Order Items:' as info;
SELECT o.table_number, o.customer_name, oi.item_name, oi.quantity, oi.price 
FROM orders o 
JOIN order_items oi ON o.id = oi.order_id 
ORDER BY o.created_at DESC, oi.created_at ASC 
LIMIT 15;
