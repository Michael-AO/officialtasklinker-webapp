-- Create functions and triggers for automatic updates

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escrow_accounts_updated_at BEFORE UPDATE ON escrow_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment application count when new application is created
CREATE OR REPLACE FUNCTION increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tasks 
    SET applications_count = applications_count + 1 
    WHERE id = NEW.task_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to decrement application count when application is deleted
CREATE OR REPLACE FUNCTION decrement_application_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tasks 
    SET applications_count = applications_count - 1 
    WHERE id = OLD.task_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

-- Create triggers for application count
CREATE TRIGGER increment_app_count AFTER INSERT ON applications FOR EACH ROW EXECUTE FUNCTION increment_application_count();
CREATE TRIGGER decrement_app_count AFTER DELETE ON applications FOR EACH ROW EXECUTE FUNCTION decrement_application_count();

-- Function to update user stats when task is completed
CREATE OR REPLACE FUNCTION update_user_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update freelancer stats
        UPDATE users 
        SET completed_tasks = completed_tasks + 1
        WHERE id = (
            SELECT freelancer_id 
            FROM applications 
            WHERE task_id = NEW.id AND status = 'accepted'
            LIMIT 1
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user stats update
CREATE TRIGGER update_user_stats AFTER UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_completion();
