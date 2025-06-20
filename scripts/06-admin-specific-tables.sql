-- Admin-specific tables and views for comprehensive dashboard functionality

-- Admin sessions table (separate from regular user sessions)
CREATE TABLE public.admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin activity log (detailed tracking of admin actions)
CREATE TABLE public.admin_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'view', 'export', 'login', 'logout'
    resource_type VARCHAR(50) NOT NULL, -- 'user', 'task', 'payment', 'dispute', 'settings'
    resource_id UUID,
    description TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID REFERENCES admin_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform analytics snapshots (daily/hourly aggregated data)
CREATE TABLE public.platform_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    hour INTEGER, -- NULL for daily snapshots, 0-23 for hourly
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    new_users_today INTEGER DEFAULT 0,
    active_users_today INTEGER DEFAULT 0,
    freelancers_count INTEGER DEFAULT 0,
    clients_count INTEGER DEFAULT 0,
    verified_users_count INTEGER DEFAULT 0,
    
    -- Task metrics
    total_tasks INTEGER DEFAULT 0,
    new_tasks_today INTEGER DEFAULT 0,
    active_tasks INTEGER DEFAULT 0,
    completed_tasks_today INTEGER DEFAULT 0,
    cancelled_tasks_today INTEGER DEFAULT 0,
    
    -- Financial metrics
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    revenue_today DECIMAL(15,2) DEFAULT 0.00,
    platform_fees_today DECIMAL(15,2) DEFAULT 0.00,
    pending_payments DECIMAL(15,2) DEFAULT 0.00,
    
    -- Engagement metrics
    new_applications_today INTEGER DEFAULT 0,
    messages_sent_today INTEGER DEFAULT 0,
    reviews_submitted_today INTEGER DEFAULT 0,
    
    -- System health
    avg_response_time_ms INTEGER DEFAULT 0,
    error_rate DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique snapshots
    UNIQUE(date, hour)
);

-- User verification requests (for admin approval)
CREATE TABLE public.user_verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    verification_type VARCHAR(50) NOT NULL, -- 'identity', 'business', 'professional'
    
    -- Submitted documents
    documents JSONB NOT NULL, -- Array of document URLs and metadata
    submitted_data JSONB, -- Additional verification data
    
    -- Admin review
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'requires_more_info'
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags and A/B tests
CREATE TABLE public.feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    
    -- Targeting rules
    target_user_types user_type[], -- Which user types see this feature
    target_percentage INTEGER DEFAULT 100, -- Percentage of users who see it
    target_conditions JSONB, -- Complex targeting conditions
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- System health monitoring
CREATE TABLE public.system_health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20), -- 'ms', 'percent', 'count', 'bytes'
    
    -- Context
    service_name VARCHAR(50), -- 'api', 'database', 'storage', 'email'
    environment VARCHAR(20) DEFAULT 'production',
    
    -- Metadata
    metadata JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content moderation queue
CREATE TABLE public.content_moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- 'task', 'profile', 'review', 'message'
    content_id UUID NOT NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Report details
    reason VARCHAR(100) NOT NULL, -- 'spam', 'inappropriate', 'fraud', 'copyright'
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    
    -- Moderation
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected', 'escalated'
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    action_taken VARCHAR(100), -- 'no_action', 'warning', 'content_removed', 'user_suspended'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Email campaigns and notifications tracking
CREATE TABLE public.email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_name VARCHAR(100),
    
    -- Targeting
    target_user_types user_type[],
    target_conditions JSONB, -- Complex targeting rules
    
    -- Content
    html_content TEXT,
    text_content TEXT,
    
    -- Scheduling
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User segments for targeted campaigns
CREATE TABLE public.user_segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Segment rules
    conditions JSONB NOT NULL, -- Complex filtering conditions
    
    -- Cache
    user_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking (for rate limiting and analytics)
CREATE TABLE public.api_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    request_size INTEGER,
    response_size INTEGER,
    response_time_ms INTEGER,
    status_code INTEGER,
    
    -- Rate limiting
    rate_limit_key VARCHAR(255),
    requests_count INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
