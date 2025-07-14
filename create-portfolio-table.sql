-- Create portfolio_items table with all required columns
-- Run this in your Supabase SQL Editor

-- First, drop the table if it exists to ensure clean creation
DROP TABLE IF EXISTS portfolio_items CASCADE;

-- Create the portfolio_items table with all required columns
CREATE TABLE portfolio_items (
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
CREATE INDEX idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX idx_portfolio_items_is_featured ON portfolio_items(is_featured);
CREATE INDEX idx_portfolio_items_created_at ON portfolio_items(created_at);

-- Disable RLS for server-side API access
-- The API handles authentication via headers, so we don't need RLS
ALTER TABLE portfolio_items DISABLE ROW LEVEL SECURITY;

-- Verify the table was created with all columns
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'portfolio_items' 
ORDER BY ordinal_position;

-- Test insert to verify everything works
INSERT INTO portfolio_items (user_id, title, description) 
VALUES (
  (SELECT id FROM users LIMIT 1), 
  'Test Portfolio Item', 
  'This is a test portfolio item to verify the table works correctly'
);

-- Clean up test data
DELETE FROM portfolio_items WHERE title = 'Test Portfolio Item';

-- Show final table structure
SELECT 'Portfolio table created successfully!' as status; 