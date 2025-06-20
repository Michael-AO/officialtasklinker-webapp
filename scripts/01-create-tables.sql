-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('freelancer', 'client')) NOT NULL,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  bio TEXT,
  location VARCHAR(255),
  hourly_rate DECIMAL(10,2),
  skills TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.0,
  completed_tasks INTEGER DEFAULT 0,
  total_earned DECIMAL(12,2) DEFAULT 0.0,
  join_date DATE DEFAULT CURRENT_DATE,
  last_active TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  skills_required TEXT[] DEFAULT '{}',
  budget_type VARCHAR(10) CHECK (budget_type IN ('fixed', 'hourly')) NOT NULL,
  budget_min DECIMAL(12,2) NOT NULL,
  budget_max DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  duration VARCHAR(50) NOT NULL,
  location VARCHAR(255) DEFAULT 'remote',
  experience_level VARCHAR(20) DEFAULT 'intermediate',
  urgency VARCHAR(10) CHECK (urgency IN ('low', 'normal', 'high')) DEFAULT 'normal',
  status VARCHAR(20) CHECK (status IN ('draft', 'active', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  visibility VARCHAR(10) CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
  requirements TEXT[] DEFAULT '{}',
  questions TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  applications_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  proposed_budget DECIMAL(12,2) NOT NULL,
  budget_type VARCHAR(10) CHECK (budget_type IN ('fixed', 'hourly')) NOT NULL,
  estimated_duration VARCHAR(50) NOT NULL,
  cover_letter TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'interviewing')) DEFAULT 'pending',
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_date TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, freelancer_id)
);

-- Create escrow_accounts table
CREATE TABLE escrow_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) CHECK (status IN ('pending', 'funded', 'released', 'disputed', 'refunded')) DEFAULT 'pending',
  milestones JSONB DEFAULT '[]',
  payment_reference VARCHAR(255),
  release_conditions TEXT,
  dispute_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(10) CHECK (message_type IN ('text', 'file', 'image', 'system')) DEFAULT 'text',
  attachments TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('task', 'application', 'payment', 'message', 'system')) NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('super_admin', 'admin', 'moderator')) NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
