-- Admin-specific functions for dashboard operations

-- Function to get dashboard summary stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'users', json_build_object(
            'total', (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL),
            'new_this_period', (SELECT COUNT(*) FROM users WHERE created_at::date BETWEEN start_date AND end_date AND deleted_at IS NULL),
            'active_7d', (SELECT COUNT(*) FROM users WHERE last_active_at >= NOW() - INTERVAL '7 days' AND deleted_at IS NULL),
            'verified', (SELECT COUNT(*) FROM users WHERE is_email_verified = true AND deleted_at IS NULL)
        ),
        'tasks', json_build_object(
            'total', (SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL),
            'new_this_period', (SELECT COUNT(*) FROM tasks WHERE created_at::date BETWEEN start_date AND end_date AND deleted_at IS NULL),
            'active', (SELECT COUNT(*) FROM tasks WHERE status IN ('open', 'in_progress') AND deleted_at IS NULL),
            'completed_this_period', (SELECT COUNT(*) FROM tasks WHERE completed_at::date BETWEEN start_date AND end_date AND deleted_at IS NULL)
        ),
        'financial', json_build_object(
            'total_revenue', (SELECT COALESCE(SUM(platform_fee), 0) FROM payments WHERE status = 'released'),
            'revenue_this_period', (SELECT COALESCE(SUM(platform_fee), 0) FROM payments WHERE created_at::date BETWEEN start_date AND end_date AND status = 'released'),
            'pending_payments', (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'held'),
            'total_transactions', (SELECT COUNT(*) FROM payments WHERE status IN ('released', 'held'))
        ),
        'engagement', json_build_object(
            'new_applications', (SELECT COUNT(*) FROM task_applications WHERE created_at::date BETWEEN start_date AND end_date),
            'new_reviews', (SELECT COUNT(*) FROM reviews WHERE created_at::date BETWEEN start_date AND end_date),
            'active_disputes', (SELECT COUNT(*) FROM disputes WHERE status IN ('open', 'in_review')),
            'avg_task_completion_days', (
                SELECT ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/86400), 1)
                FROM tasks 
                WHERE status = 'completed' 
                AND completed_at::date BETWEEN start_date AND end_date
            )
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get user growth data for charts
CREATE OR REPLACE FUNCTION get_user_growth_data(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    date DATE,
    new_users BIGINT,
    cumulative_users BIGINT,
    new_freelancers BIGINT,
    new_clients BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (days_back || ' days')::INTERVAL,
            CURRENT_DATE,
            '1 day'::INTERVAL
        )::DATE as date
    ),
    daily_stats AS (
        SELECT 
            u.created_at::DATE as date,
            COUNT(*) as new_users,
            COUNT(*) FILTER (WHERE user_type = 'freelancer') as new_freelancers,
            COUNT(*) FILTER (WHERE user_type = 'client') as new_clients
        FROM users u
        WHERE u.created_at::DATE >= CURRENT_DATE - (days_back || ' days')::INTERVAL
            AND u.deleted_at IS NULL
        GROUP BY u.created_at::DATE
    )
    SELECT 
        ds.date,
        COALESCE(daily_stats.new_users, 0) as new_users,
        SUM(COALESCE(daily_stats.new_users, 0)) OVER (ORDER BY ds.date) as cumulative_users,
        COALESCE(daily_stats.new_freelancers, 0) as new_freelancers,
        COALESCE(daily_stats.new_clients, 0) as new_clients
    FROM date_series ds
    LEFT JOIN daily_stats ON ds.date = daily_stats.date
    ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get revenue analytics
CREATE OR REPLACE FUNCTION get_revenue_analytics(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    date DATE,
    daily_revenue DECIMAL(12,2),
    cumulative_revenue DECIMAL(12,2),
    transaction_count BIGINT,
    avg_transaction_value DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            CURRENT_DATE - (days_back || ' days')::INTERVAL,
            CURRENT_DATE,
            '1 day'::INTERVAL
        )::DATE as date
    ),
    daily_revenue AS (
        SELECT 
            p.created_at::DATE as date,
            SUM(p.platform_fee) as daily_revenue,
            COUNT(*) as transaction_count,
            AVG(p.amount) as avg_transaction_value
        FROM payments p
        WHERE p.created_at::DATE >= CURRENT_DATE - (days_back || ' days')::INTERVAL
            AND p.status = 'released'
        GROUP BY p.created_at::DATE
    )
    SELECT 
        ds.date,
        COALESCE(dr.daily_revenue, 0) as daily_revenue,
        SUM(COALESCE(dr.daily_revenue, 0)) OVER (ORDER BY ds.date) as cumulative_revenue,
        COALESCE(dr.transaction_count, 0) as transaction_count,
        COALESCE(dr.avg_transaction_value, 0) as avg_transaction_value
    FROM date_series ds
    LEFT JOIN daily_revenue dr ON ds.date = dr.date
    ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql;

-- Function to suspend/unsuspend users
CREATE OR REPLACE FUNCTION admin_update_user_status(
    target_user_id UUID,
    new_status user_status,
    admin_user_id UUID,
    reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    old_status user_status;
    user_email VARCHAR(255);
BEGIN
    -- Check if admin user exists and is admin
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = admin_user_id 
        AND user_type = 'admin' 
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Admin user not found or inactive';
    END IF;
    
    -- Get current user status and email
    SELECT status, email INTO old_status, user_email
    FROM users 
    WHERE id = target_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Update user status
    UPDATE users 
    SET 
        status = new_status,
        updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Log the action
    INSERT INTO admin_activity_log (
        admin_id,
        action_type,
        resource_type,
        resource_id,
        description,
        old_values,
        new_values
    ) VALUES (
        admin_user_id,
        'update',
        'user',
        target_user_id,
        COALESCE(reason, 'User status changed from ' || old_status || ' to ' || new_status),
        json_build_object('status', old_status),
        json_build_object('status', new_status)
    );
    
    -- Create notification for user
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        entity_type,
        entity_id
    ) VALUES (
        target_user_id,
        'Account Status Updated',
        'Your account status has been changed to: ' || new_status,
        'system',
        'user',
        target_user_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform health metrics
CREATE OR REPLACE FUNCTION get_platform_health_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'system_status', 'healthy',
        'uptime_percentage', 99.9,
        'active_users_24h', (
            SELECT COUNT(*) 
            FROM users 
            WHERE last_active_at >= NOW() - INTERVAL '24 hours'
            AND deleted_at IS NULL
        ),
        'tasks_created_24h', (
            SELECT COUNT(*) 
            FROM tasks 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
            AND deleted_at IS NULL
        ),
        'payments_processed_24h', (
            SELECT COUNT(*) 
            FROM payments 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        ),
        'avg_response_time_ms', (
            SELECT AVG(response_time_ms)
            FROM api_usage_logs 
            WHERE created_at >= NOW() - INTERVAL '1 hour'
        ),
        'error_rate_percentage', (
            SELECT 
                CASE 
                    WHEN COUNT(*) > 0 THEN 
                        ROUND((COUNT(*) FILTER (WHERE status_code >= 400)::DECIMAL / COUNT(*)) * 100, 2)
                    ELSE 0 
                END
            FROM api_usage_logs 
            WHERE created_at >= NOW() - INTERVAL '1 hour'
        ),
        'database_connections', (
            SELECT count(*) 
            FROM pg_stat_activity 
            WHERE state = 'active'
        ),
        'pending_disputes', (
            SELECT COUNT(*) 
            FROM disputes 
            WHERE status IN ('open', 'in_review')
        ),
        'unread_support_tickets', 0, -- Placeholder for future support system
        'storage_usage_gb', 0 -- Placeholder for storage metrics
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
