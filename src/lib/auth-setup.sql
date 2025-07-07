-- Authentication and User Profile Tables
-- Run this SQL in your Supabase SQL editor

-- Note: JWT secret is automatically managed by Supabase
-- No need to set app.jwt_secret manually

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  restaurant_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin', 'owner')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user sessions table for enhanced security
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit log table for security tracking
CREATE TABLE IF NOT EXISTS public.auth_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'login', 'logout', 'register', 'password_change', 'failed_login'
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON public.auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_action ON public.auth_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON public.auth_audit_log(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Staff can view customer profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin', 'owner')
    )
  );

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for password_reset_tokens
CREATE POLICY "Users can view own reset tokens" ON public.password_reset_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for email_verification_tokens
CREATE POLICY "Users can view own verification tokens" ON public.email_verification_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for auth_audit_log
CREATE POLICY "Users can view own audit log" ON public.auth_audit_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all audit logs" ON public.auth_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to clean up expired tokens and sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_auth_data()
RETURNS void AS $$
BEGIN
  -- Clean up expired sessions
  DELETE FROM public.user_sessions WHERE expires_at < NOW();
  
  -- Clean up expired password reset tokens
  DELETE FROM public.password_reset_tokens WHERE expires_at < NOW();
  
  -- Clean up expired email verification tokens
  DELETE FROM public.email_verification_tokens WHERE expires_at < NOW();
  
  -- Clean up old audit logs (keep last 90 days)
  DELETE FROM public.auth_audit_log WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.password_reset_tokens TO authenticated;
GRANT ALL ON public.email_verification_tokens TO authenticated;
GRANT ALL ON public.auth_audit_log TO authenticated;

-- Allow anon users to insert audit logs (for failed login attempts)
GRANT INSERT ON public.auth_audit_log TO anon;

COMMIT;