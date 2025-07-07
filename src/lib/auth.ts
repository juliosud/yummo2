import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  restaurant_name?: string;
  phone?: string;
  role: "customer" | "staff" | "admin" | "owner";
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  restaurantName?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Get current user session
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error getting user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Sign up new user
export const signUp = async (userData: SignUpData): Promise<AuthResponse> => {
  try {
    // Log signup attempt
    await logAuthEvent(null, "register", true, {
      email: userData.email,
      has_restaurant_name: !!userData.restaurantName,
    });

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          restaurant_name: userData.restaurantName,
          phone: userData.phone,
        },
      },
    });

    if (error) {
      await logAuthEvent(null, "register", false, {
        email: userData.email,
        error: error.message,
      });
      return { user: null, session: null, error };
    }

    // Create session record if signup successful
    if (data.session) {
      await createUserSession(data.user!.id, data.session.access_token);
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      user: null,
      session: null,
      error: error as Error,
    };
  }
};

// Sign in user
export const signIn = async (
  credentials: SignInData,
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      await logAuthEvent(null, "login", false, {
        email: credentials.email,
        error: error.message,
      });
      return { user: null, session: null, error };
    }

    // Log successful login
    await logAuthEvent(data.user!.id, "login", true, {
      email: credentials.email,
      remember_me: credentials.rememberMe,
    });

    // Update last login time
    await supabase
      .from("user_profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.user!.id);

    // Create session record
    if (data.session) {
      await createUserSession(data.user!.id, data.session.access_token);
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    console.error("Signin error:", error);
    return {
      user: null,
      session: null,
      error: error as Error,
    };
  }
};

// Sign out user
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const user = await getCurrentUser();

    // Invalidate all user sessions
    if (user) {
      await supabase
        .from("user_sessions")
        .update({ is_active: false })
        .eq("user_id", user.id);

      await logAuthEvent(user.id, "logout", true);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Signout error:", error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error("Signout error:", error);
    return { error: error as Error };
  }
};

// Reset password
export const resetPassword = async (
  email: string,
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return { error };
    }

    await logAuthEvent(null, "password_reset_request", true, { email });
    return { error: null };
  } catch (error) {
    console.error("Password reset error:", error);
    return { error: error as Error };
  }
};

// Update password
export const updatePassword = async (
  newPassword: string,
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Password update error:", error);
      return { error };
    }

    const user = await getCurrentUser();
    if (user) {
      await logAuthEvent(user.id, "password_change", true);
    }

    return { error: null };
  } catch (error) {
    console.error("Password update error:", error);
    return { error: error as Error };
  }
};

// Update user profile
export const updateUserProfile = async (
  updates: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>,
): Promise<{ error: Error | null }> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: new Error("User not authenticated") };
    }

    const { error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Profile update error:", error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: error as Error };
  }
};

// Create user session record
const createUserSession = async (userId: string, sessionToken: string) => {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    await supabase.from("user_sessions").insert({
      user_id: userId,
      session_token: sessionToken,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating session record:", error);
  }
};

// Log authentication events
const logAuthEvent = async (
  userId: string | null,
  action: string,
  success: boolean,
  details?: any,
) => {
  try {
    await supabase.from("auth_audit_log").insert({
      user_id: userId,
      action,
      success,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
      details,
    });
  } catch (error) {
    console.error("Error logging auth event:", error);
  }
};

// Get client IP address (simplified)
const getClientIP = async (): Promise<string | null> => {
  try {
    // In production, you might want to use a service to get the real IP
    // For now, we'll return null and let the database handle it
    return null;
  } catch (error) {
    return null;
  }
};

// Check if user has specific role
export const hasRole = async (
  requiredRole: UserProfile["role"],
): Promise<boolean> => {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return false;

    const roleHierarchy = {
      customer: 0,
      staff: 1,
      admin: 2,
      owner: 3,
    };

    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};
