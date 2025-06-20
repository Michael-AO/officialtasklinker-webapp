-- Admin-specific views for dashboard analytics

-- User analytics view
CREATE OR REPLACE VIEW admin_user_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as new_users,
    COUNT(*) FILTER (WHERE user_type = 'freelancer') as new_freelancers,
    COUNT(*) FILTER (WHERE user_type = 'client') as new_clients,
    COUNT(*) FILTER (WHERE is_email_verified = true) as verified_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE last_active_at >= NOW() - INTERVAL '7 days') as weekly_active,
    COUNT(*) FILTER (WHERE last_active_at >= NOW() - INTERVAL '30 days') as monthly_active
FROM users 
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Task analytics view
CREATE OR REPLACE VIEW admin_task_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'open') as open_tasks,
    COUNT(*) FILTER (WHERE status = 'in_progress') as active_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_tasks,
    AVG(budget_max) as avg_budget,
    SUM(budget_max) FILTER (WHERE status = 'completed') as total_completed_value,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/86400) FILTER (WHERE status = 'completed') as avg_completion_days
FROM tasks 
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Financial analytics view
CREATE OR REPLACE VIEW admin_financial_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_payments,
    SUM(amount) as total_amount,
    SUM(platform_fee) as total_fees,
    SUM(net_amount) as total_payouts,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_payments,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
    AVG(amount) as avg_payment_amount
FROM payments
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- User engagement metrics
CREATE OR REPLACE VIEW admin_engagement_metrics AS
SELECT 
    u.id,
    u.email,
    u.display_name,
    u.user_type,
    u.created_at as registration_date,
    u.last_active_at,
    u.rating,
    u.total_reviews,
    u.completed_tasks,
    
    -- Task metrics
    COALESCE(task_stats.tasks_created, 0) as tasks_created,
    COALESCE(task_stats.tasks_completed, 0) as tasks_completed_as_freelancer,
    COALESCE(app_stats.applications_sent, 0) as applications_sent,
    
    -- Financial metrics
    COALESCE(payment_stats.total_earned, 0) as total_earned,
    COALESCE(payment_stats.total_spent, 0) as total_spent,
    
    -- Engagement score (calculated)
    CASE 
        WHEN u.last_active_at >= NOW() - INTERVAL '7 days' THEN 'highly_active'
        WHEN u.last_active_at >= NOW() - INTERVAL '30 days' THEN 'active'
        WHEN u.last_active_at >= NOW() - INTERVAL '90 days' THEN 'inactive'
        ELSE 'dormant'
    END as activity_level
    
FROM users u
LEFT JOIN (
    SELECT 
        client_id,
        COUNT(*) as tasks_created,
        COUNT(*) FILTER (WHERE status = 'completed') as tasks_completed
    FROM tasks 
    WHERE deleted_at IS NULL
    GROUP BY client_id
) task_stats ON u.id = task_stats.client_id
LEFT JOIN (
    SELECT 
        freelancer_id,
        COUNT(*) as applications_sent
    FROM task_applications
    GROUP BY freelancer_id
) app_stats ON u.id = app_stats.freelancer_id
LEFT JOIN (
    SELECT 
        payee_id,
        SUM(net_amount) as total_earned,
        0 as total_spent
    FROM payments 
    WHERE status = 'released'
    GROUP BY payee_id
    
    UNION ALL
    
    SELECT 
        payer_id,
        0 as total_earned,
        SUM(amount) as total_spent
    FROM payments 
    WHERE status IN ('released', 'held')
    GROUP BY payer_id
) payment_stats ON u.id = payment_stats.payee_id OR u.id = payment_stats.payer_id
WHERE u.deleted_at IS NULL;

-- Category performance view
CREATE OR REPLACE VIEW admin_category_performance AS
SELECT 
    c.id,
    c.name,
    c.slug,
    COUNT(t.id) as total_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
    AVG(t.budget_max) as avg_budget,
    SUM(t.budget_max) FILTER (WHERE t.status = 'completed') as total_value,
    COUNT(DISTINCT t.client_id) as unique_clients,
    COUNT(DISTINCT t.freelancer_id) as unique_freelancers,
    AVG(t.applications_count) as avg_applications_per_task,
    
    -- Calculate completion rate
    CASE 
        WHEN COUNT(t.id) > 0 THEN 
            ROUND((COUNT(t.id) FILTER (WHERE t.status = 'completed')::DECIMAL / COUNT(t.id)) * 100, 2)
        ELSE 0 
    END as completion_rate_percent
    
FROM categories c
LEFT JOIN tasks t ON c.id = t.category_id AND t.deleted_at IS NULL
WHERE c.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY total_tasks DESC;

-- Dispute analytics view
CREATE OR REPLACE VIEW admin_dispute_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_disputes,
    COUNT(*) FILTER (WHERE status = 'open') as open_disputes,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_disputes,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/86400) FILTER (WHERE status = 'resolved') as avg_resolution_days,
    
    -- By dispute type
    COUNT(*) FILTER (WHERE dispute_type = 'quality') as quality_disputes,
    COUNT(*) FILTER (WHERE dispute_type = 'payment') as payment_disputes,
    COUNT(*) FILTER (WHERE dispute_type = 'communication') as communication_disputes,
    
    -- Resolution amounts
    AVG(resolution_amount) FILTER (WHERE status = 'resolved') as avg_resolution_amount,
    SUM(resolution_amount) FILTER (WHERE status = 'resolved') as total_resolution_amount
    
FROM disputes
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Top performers view
CREATE OR REPLACE VIEW admin_top_performers AS
SELECT 
    u.id,
    u.display_name,
    u.email,
    u.user_type,
    u.rating,
    u.total_reviews,
    u.completed_tasks,
    u.total_earnings,
    u.success_rate,
    
    -- Recent activity
    COUNT(t.id) FILTER (WHERE t.created_at >= NOW() - INTERVAL '30 days') as tasks_last_30_days,
    COUNT(ta.id) FILTER (WHERE ta.created_at >= NOW() - INTERVAL '30 days') as applications_last_30_days,
    
    -- Performance metrics
    CASE u.user_type
        WHEN 'freelancer' THEN u.total_earnings
        WHEN 'client' THEN COALESCE(client_spending.total_spent, 0)
        ELSE 0
    END as total_platform_value
    
FROM users u
LEFT JOIN tasks t ON (u.id = t.client_id OR u.id = t.freelancer_id)
LEFT JOIN task_applications ta ON u.id = ta.freelancer_id
LEFT JOIN (
    SELECT 
        payer_id,
        SUM(amount) as total_spent
    FROM payments 
    WHERE status IN ('released', 'held')
    GROUP BY payer_id
) client_spending ON u.id = client_spending.payer_id
WHERE u.deleted_at IS NULL 
    AND u.status = 'active'
    AND (u.rating >= 4.0 OR u.completed_tasks >= 5)
GROUP BY u.id, u.display_name, u.email, u.user_type, u.rating, u.total_reviews, 
         u.completed_tasks, u.total_earnings, u.success_rate, client_spending.total_spent
ORDER BY total_platform_value DESC, u.rating DESC
LIMIT 100;

-- System health overview
CREATE OR REPLACE VIEW admin_system_health AS
SELECT 
    'users' as metric_category,
    'total_users' as metric_name,
    COUNT(*)::TEXT as metric_value,
    'count' as metric_unit,
    NOW() as calculated_at
FROM users WHERE deleted_at IS NULL

UNION ALL

SELECT 
    'users' as metric_category,
    'active_users_7d' as metric_name,
    COUNT(*)::TEXT as metric_value,
    'count' as metric_unit,
    NOW() as calculated_at
FROM users 
WHERE deleted_at IS NULL 
    AND last_active_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
    'tasks' as metric_category,
    'total_tasks' as metric_name,
    COUNT(*)::TEXT as metric_value,
    'count' as metric_unit,
    NOW() as calculated_at
FROM tasks WHERE deleted_at IS NULL

UNION ALL

SELECT 
    'tasks' as metric_category,
    'active_tasks' as metric_name,
    COUNT(*)::TEXT as metric_value,
    'count' as metric_unit,
    NOW() as calculated_at
FROM tasks 
WHERE deleted_at IS NULL 
    AND status IN ('open', 'in_progress')

UNION ALL

SELECT 
    'financial' as metric_category,
    'total_revenue' as metric_name,
    SUM(platform_fee)::TEXT as metric_value,
    'NGN' as metric_unit,
    NOW() as calculated_at
FROM payments 
WHERE status = 'released'

UNION ALL

SELECT 
    'financial' as metric_category,
    'pending_payments' as metric_name,
    SUM(amount)::TEXT as metric_value,
    'NGN' as metric_unit,
    NOW() as calculated_at
FROM payments 
WHERE status = 'held';
