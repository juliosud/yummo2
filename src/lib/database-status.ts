import { isSupabaseConfigured } from "./supabase";

/**
 * Database connection status utility
 */
export const getDatabaseStatus = () => {
  return {
    isConnected: isSupabaseConfigured,
    status: isSupabaseConfigured ? "connected" : "disconnected",
    message: isSupabaseConfigured
      ? "Connected to Supabase database"
      : "Using mock data - database not configured",
  };
};

/**
 * Log database connection status with helpful information
 */
export const logDatabaseStatus = (component: string) => {
  const status = getDatabaseStatus();
  const emoji = status.isConnected ? "✅" : "⚠️";

  console.log(`${emoji} ${component}: ${status.message}`);

  if (!status.isConnected) {
    console.log("🔧 To connect to database:");
    console.log("   1. Go to project settings in Tempo");
    console.log("   2. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
    console.log("   3. Run SQL setup from src/lib/database-setup.sql");
  }
};

/**
 * Check if database operations should use real data or mock data
 */
export const shouldUseMockData = () => {
  return !isSupabaseConfigured;
};
