-- Insert sample data for development and testing

-- Insert sample users
INSERT INTO users (id, email, name, user_type, is_verified, bio, location, hourly_rate, skills, rating, completed_tasks) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'John Doe', 'freelancer', true, 'Full-stack developer with 5+ years experience', 'Lagos, Nigeria', 45.00, ARRAY['React', 'Node.js', 'TypeScript', 'Python'], 4.8, 24),
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'Jane Smith', 'client', true, 'Tech startup founder looking for talented developers', 'San Francisco, CA', null, ARRAY[], 0.0, 0),
('550e8400-e29b-41d4-a716-446655440003', 'alex.rodriguez@example.com', 'Alex Rodriguez', 'freelancer', true, 'UI/UX Designer specializing in mobile apps', 'New York, NY', 60.00, ARRAY['Figma', 'Adobe XD', 'Sketch', 'Prototyping'], 4.9, 18),
('550e8400-e29b-41d4-a716-446655440004', 'sarah.wilson@example.com', 'Sarah Wilson', 'client', true, 'Marketing agency owner', 'London, UK', null, ARRAY[], 0.0, 0);

-- Insert sample tasks
INSERT INTO tasks (id, client_id, title, description, category, skills_required, budget_type, budget_min, budget_max, duration, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'E-commerce Website Development', 'Build a modern e-commerce platform with React and Node.js', 'Web Development', ARRAY['React', 'Node.js', 'MongoDB'], 'fixed', 2500.00, 4000.00, '6-8 weeks', 'active'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Mobile App UI Design', 'Design a beautiful and intuitive mobile app interface', 'UI/UX Design', ARRAY['Figma', 'Mobile Design', 'Prototyping'], 'fixed', 1500.00, 2500.00, '3-4 weeks', 'active'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'API Development', 'Build RESTful APIs for mobile application', 'Backend Development', ARRAY['Node.js', 'Express', 'PostgreSQL'], 'hourly', 40.00, 70.00, '4-6 weeks', 'active');

-- Insert sample applications
INSERT INTO applications (task_id, freelancer_id, proposed_budget, budget_type, estimated_duration, cover_letter, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 3200.00, 'fixed', '6 weeks', 'I have extensive experience building e-commerce platforms...', 'pending'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 2000.00, 'fixed', '3 weeks', 'I specialize in mobile UI/UX design and would love to work on this project...', 'accepted');

-- Insert sample admin users
INSERT INTO admin_users (email, name, role, permissions) VALUES
('admin@tasklinkers.com', 'Admin User', 'super_admin', ARRAY['all']),
('moderator@tasklinkers.com', 'Moderator User', 'moderator', ARRAY['manage_users', 'manage_tasks', 'manage_disputes']);

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'New Task Match', 'A new task matching your skills has been posted', 'task'),
('550e8400-e29b-41d4-a716-446655440002', 'Application Received', 'You received a new application for your task', 'application');
