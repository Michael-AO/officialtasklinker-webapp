-- Additional indexes for admin-specific queries

-- Admin sessions indexes
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX idx_admin_sessions_active ON admin_sessions(is_active, expires_at);

-- Admin activity log indexes
CREATE INDEX idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_action_type ON admin_activity_log(action_type);
CREATE INDEX idx_admin_activity_resource ON admin_activity_log(resource_type, resource_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX idx_admin_activity_session ON admin_activity_log(session_id);

-- Platform analytics indexes
CREATE INDEX idx_platform_analytics_date ON platform_analytics(date DESC);
CREATE INDEX idx_platform_analytics_date_hour ON platform_analytics(date, hour);

-- User verification requests indexes
CREATE INDEX idx_verification_requests_user_id ON user_verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON user_verification_requests(status);
CREATE INDEX idx_verification_requests_type ON user_verification_requests(verification_type);
CREATE INDEX idx_verification_requests_reviewed_by ON user_verification_requests(reviewed_by);
CREATE INDEX idx_verification_requests_created_at ON user_verification_requests(created_at DESC);

-- Feature flags indexes
CREATE INDEX idx_feature_flags_name ON feature_flags(name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);
CREATE INDEX idx_feature_flags_expires ON feature_flags(expires_at);

-- System health metrics indexes
CREATE INDEX idx_health_metrics_name ON system_health_metrics(metric_name);
CREATE INDEX idx_health_metrics_service ON system_health_metrics(service_name);
CREATE INDEX idx_health_metrics_recorded_at ON system_health_metrics(recorded_at DESC);

-- Content moderation indexes
CREATE INDEX idx_moderation_content ON content_moderation_queue(content_type, content_id);
CREATE INDEX idx_moderation_status ON content_moderation_queue(status);
CREATE INDEX idx_moderation_assigned ON content_moderation_queue(assigned_to);
CREATE INDEX idx_moderation_severity ON content_moderation_queue(severity);
CREATE INDEX idx_moderation_created_at ON content_moderation_queue(created_at DESC);

-- Email campaigns indexes
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);
CREATE INDEX idx_email_campaigns_created_by ON email_campaigns(created_by);

-- User segments indexes
CREATE INDEX idx_user_segments_name ON user_segments(name);
CREATE INDEX idx_user_segments_created_by ON user_segments(created_by);

-- API usage logs indexes
CREATE INDEX idx_api_usage_user_id ON api_usage_logs(user_id);
CREATE INDEX idx_api_usage_endpoint ON api_usage_logs(endpoint);
CREATE INDEX idx_api_usage_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX idx_api_usage_status_code ON api_usage_logs(status_code);
CREATE INDEX idx_api_usage_rate_limit ON api_usage_logs(rate_limit_key, created_at);
