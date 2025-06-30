-- Create indexes for better performance

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_verified ON users(is_verified);
CREATE INDEX idx_users_skills ON users USING GIN(skills);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_rating ON users(rating);

-- Tasks table indexes
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_budget_range ON tasks(budget_min, budget_max);
CREATE INDEX idx_tasks_skills_required ON tasks USING GIN(skills_required);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_visibility ON tasks(visibility);

-- Applications table indexes
CREATE INDEX idx_applications_task_id ON applications(task_id);
CREATE INDEX idx_applications_freelancer_id ON applications(freelancer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_date ON applications(applied_date);

-- Escrow accounts table indexes
CREATE INDEX idx_escrow_task_id ON escrow_accounts(task_id);
CREATE INDEX idx_escrow_client_id ON escrow_accounts(client_id);
CREATE INDEX idx_escrow_freelancer_id ON escrow_accounts(freelancer_id);
CREATE INDEX idx_escrow_status ON escrow_accounts(status);

-- Messages table indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Notifications table indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Email OTPs table indexes
CREATE INDEX idx_email_otps_email ON email_otps(email);
CREATE INDEX idx_email_otps_otp ON email_otps(otp);
CREATE INDEX idx_email_otps_expires_at ON email_otps(expires_at);
CREATE INDEX idx_email_otps_used ON email_otps(used);

-- Admin users table indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);
