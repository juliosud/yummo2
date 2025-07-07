import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import {
  getCurrentUser,
  getCurrentUserProfile,
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  updateUserProfile,
  hasRole,
  onAuthStateChange,
  UserProfile,
  SignUpData,
  SignInData,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (userData: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (credentials: SignInData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (
    updates: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>,
  ) => Promise<{ error: Error | null }>;
  hasRole: (role: UserProfile["role"]) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile
  const loadUserProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      const userProfile = await getCurrentUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        await loadUserProfile(currentUser);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (user) => {
      setUser(user);
      await loadUserProfile(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up wrapper
  const handleSignUp = async (userData: SignUpData) => {
    try {
      setLoading(true);
      const { user: newUser, session, error } = await signUp(userData);

      if (error) {
        return { error };
      }

      if (newUser) {
        setUser(newUser);
        await loadUserProfile(newUser);
      }

      return { error: null };
    } catch (error) {
      console.error("Signup error:", error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in wrapper
  const handleSignIn = async (credentials: SignInData) => {
    try {
      setLoading(true);
      const { user: signedInUser, session, error } = await signIn(credentials);

      if (error) {
        return { error };
      }

      if (signedInUser) {
        setUser(signedInUser);
        await loadUserProfile(signedInUser);
      }

      return { error: null };
    } catch (error) {
      console.error("Signin error:", error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out wrapper
  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await signOut();

      if (!error) {
        setUser(null);
        setProfile(null);
      }

      return { error };
    } catch (error) {
      console.error("Signout error:", error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Update profile wrapper
  const handleUpdateProfile = async (
    updates: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>,
  ) => {
    try {
      const { error } = await updateUserProfile(updates);

      if (!error && profile) {
        // Update local profile state
        setProfile({ ...profile, ...updates });
      }

      return { error };
    } catch (error) {
      console.error("Profile update error:", error);
      return { error: error as Error };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword,
    updatePassword,
    updateProfile: handleUpdateProfile,
    hasRole,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
