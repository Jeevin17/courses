# Supabase Database Setup

## SQL Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table (data is encrypted client-side)
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  data TEXT NOT NULL,  -- Encrypted data stored as TEXT
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default announcement
INSERT INTO system_settings (key, value) VALUES ('announcement', '');

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User progress policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- System settings policies
CREATE POLICY "Anyone can read system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC function to delete user account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Setup Instructions

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a free project.

2. **Run the SQL**: Copy the SQL above and run it in your Supabase SQL Editor.

3. **Get Your Keys**:
   - Go to Project Settings > API
   - Copy your `Project URL` and `anon/public` key

4. **Update `.env.local`**:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

5. **Make Yourself Admin** (Optional):
   - Register an account in the app
   - Go to Supabase Dashboard > Table Editor > `profiles`
   - Find your user and set `is_admin` to `true`

6. **Restart Dev Server**: `npm run dev`

## Security Features

- ✅ **End-to-End Encryption**: All user data is encrypted client-side using AES-GCM before being sent to Supabase
- ✅ **Key Derivation**: Encryption keys are derived from user email using PBKDF2 (100,000 iterations)
- ✅ **Row Level Security**: Database policies ensure users can only access their own data
- ✅ **Account Deletion**: Users can permanently delete their account and all associated data
- ✅ **Secure Admin Access**: Only users with `is_admin = true` can modify system settings

## Features

- ✅ User Authentication (Email/Password)
- ✅ Cloud Sync (Auto-saves encrypted progress)
- ✅ Admin Dashboard (Manage announcements)
- ✅ Account Deletion (Permanent, cannot be undone)
- ✅ Secure Row Level Security
- ✅ Free Tier (Up to 50,000 monthly active users)
