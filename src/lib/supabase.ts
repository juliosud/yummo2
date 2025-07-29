import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are not available
const createMockClient = () => {
  console.warn("🔌 Database Connection Status: DISCONNECTED");
  console.warn("📋 Using mock data for development");
  console.warn("⚙️  To connect to Supabase:");
  console.warn("   1. Go to project settings in Tempo");
  console.warn("   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
  console.warn("   3. Run the SQL setup from src/lib/database-setup.sql");
  return {
    from: (table: string) => ({
      select: (columns?: string) => Promise.resolve({ data: [], error: null }),
      insert: (data: any) => Promise.resolve({ data: null, error: null }),
      update: (data: any) => ({
        eq: (column: string, value: any) =>
          Promise.resolve({ data: null, error: null }),
      }),
      delete: () => ({
        eq: (column: string, value: any) =>
          Promise.resolve({ data: null, error: null }),
      }),
      eq: (column: string, value: any) => ({
        select: (columns?: string) =>
          Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      order: (column: string, options?: any) =>
        Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
    }),
    channel: (name: string) => ({
      on: (event: string, config: any, callback: Function) => ({
        subscribe: () => ({ unsubscribe: () => {} }),
      }),
    }),
  };
};

// Check if environment variables are available
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Log database connection status
if (isSupabaseConfigured) {
  console.log("🔌 Database Connection Status: CONNECTED");
  console.log("📊 Using live Supabase database");
  console.log("🌐 Database URL:", supabaseUrl?.substring(0, 30) + "...");
} else {
  console.log("🔌 Database Connection Status: USING MOCK DATA");
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Raw SQL query execution function
export const executeRawQuery = async (query: string) => {
  if (!isSupabaseConfigured) {
    console.warn("⚠️ Database not configured - cannot execute raw queries");
    return { data: null, error: { message: "Database not configured" } };
  }

  try {
    console.log("🔍 Executing SQL query:", query.substring(0, 100) + "...");

    // Call the execute_sql function we created in Supabase
    const { data, error } = await supabase.rpc("execute_sql", { query });

    if (error) {
      console.error("❌ SQL query error:", error);
      return { data: null, error };
    }

    // The execute_sql function returns JSONB objects, so we need to extract the actual data
    let processedData = data;
    if (data && Array.isArray(data) && data.length > 0) {
      // If the data contains 'result' property, extract it
      if (data[0].result) {
        processedData = data.map((item) => item.result);
      }
    }

    console.log(
      "✅ SQL query successful, rows returned:",
      processedData?.length || 0,
    );
    return { data: processedData, error: null };
  } catch (error) {
    console.error("❌ SQL query execution failed:", error);
    return {
      data: null,
      error: { message: error.message || "Query execution failed" },
    };
  }
};

// Database types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  prep_time: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  item_name: string;
  menu_item?: MenuItem;
}

export interface CartItem {
  id: string;
  session_id: string;
  table_number: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  item_name: string;
  item_image?: string;
  created_at: string;
  updated_at: string;
  menu_item?: MenuItem;
}

export interface Order {
  id: string;
  table_number: string;
  session_code?: string; //------------------------------------------------NOTE
  status: "pending" | "preparing" | "ready" | "completed";
  total: number;
  estimated_minutes?: number;

  customer_name?: string;
  customer_phone?: string;
  notes?: string;

  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface Table {
  id: string;
  table_id: string;
  name: string;
  seats: number;
  status: "available" | "occupied" | "reserved";
  table_type: "regular" | "terminal";
  x_position: number;
  y_position: number;
  created_at: string;
  updated_at: string;
}

export interface TableSession {
  id: string;
  table_id: string;
  session_code: string;
  is_active: boolean;
  qr_code_data?: string;
  menu_url?: string;
  created_at: string;
  updated_at: string;
  ended_at?: string;
}
