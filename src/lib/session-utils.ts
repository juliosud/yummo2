import { supabase } from "@/lib/supabase";

/**
 * Check if a session is active for the given session code
 */
export const checkSessionActive = async (
  sessionCode: string,
): Promise<boolean> => {
  try {
    // If Supabase is not configured, allow access (fallback for development)
    if (
      !import.meta.env.VITE_SUPABASE_URL ||
      !import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      console.log("🔧 Session check: Database not configured, allowing access");
      return true;
    }

    const { data, error } = await supabase
      .from("table_sessions")
      .select("*")
      .eq("session_code", sessionCode)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("❌ Session check error:", error);
      return false;
    }

    const isActive = !!data;
    console.log(
      `🔍 Session check for ${sessionCode}: ${isActive ? "ACTIVE" : "INACTIVE"}`,
    );
    return isActive;
  } catch (error) {
    console.error("❌ Session check failed:", error);
    return false;
  }
};

/**
 * Get session details by session code
 */
export const getSessionDetails = async (sessionCode: string) => {
  try {
    // If Supabase is not configured, return null (fallback for development)
    if (
      !import.meta.env.VITE_SUPABASE_URL ||
      !import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      console.log("🔧 Session details: Database not configured");
      return null;
    }

    const { data, error } = await supabase
      .from("table_sessions")
      .select("*")
      .eq("session_code", sessionCode)
      .single();

    if (error) {
      console.error("❌ Get session details error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("❌ Get session details failed:", error);
    return null;
  }
};

/**
 * Extract session code from URL parameters
 */
export const getSessionCodeFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("session");
};

/**
 * Extract table ID from URL parameters
 */
export const getTableIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("table");
};
