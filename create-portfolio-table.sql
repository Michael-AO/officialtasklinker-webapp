-- Create portfolio_items table if it doesn't exist
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  file_url TEXT,
  file_type VARCHAR(100),
  file_name VARCHAR(255),
  file_size INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_is_featured ON portfolio_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_created_at ON portfolio_items(created_at);

-- Enable RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can insert their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can update their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Public can view portfolio items" ON portfolio_items;

-- Create RLS policies
CREATE POLICY "Users can view their own portfolio items" ON portfolio_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio items" ON portfolio_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio items" ON portfolio_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio items" ON portfolio_items
  FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access for portfolio items
CREATE POLICY "Public can view portfolio items" ON portfolio_items
  FOR SELECT USING (true);

-- Verify the table was created
SELECT * FROM portfolio_items LIMIT 0; 