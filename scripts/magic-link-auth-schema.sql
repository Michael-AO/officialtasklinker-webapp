-- ========================================
-- MAGIC LINK AUTHENTICATION SCHEMA
-- TaskLinkers - Passwordless Authentication System
-- ========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. MAGIC LINKS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS magic_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token TEXT NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('signup', 'login', 'password_reset')),
    user_type VARCHAR(50) CHECK (user_type IN ('freelancer', 'client', 'admin')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT
);

-- Indexes for magic_links
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON magic_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_magic_links_type ON magic_links(type);

-- ========================================
-- 2. USER SESSIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invalidated_at TIMESTAMP WITH TIME ZONE,
    user_agent TEXT,
    ip_address INET,
    device_fingerprint TEXT
);

-- Indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_invalidated ON user_sessions(invalidated_at) WHERE invalidated_at IS NULL;

-- ========================================
-- 3. AUDIT LOGS TABLE (HIPAA-Compliant)
-- ========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) CHECK (event_category IN ('auth', 'user', 'task', 'payment', 'security', 'system')),
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    session_id UUID,
    email VARCHAR(255),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_category ON audit_logs(event_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON audit_logs(email);

-- ========================================
-- 4. RATE LIMIT ATTEMPTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS rate_limit_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for rate_limit_attempts
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_action ON rate_limit_attempts(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at ON rate_limit_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON rate_limit_attempts(ip_address);

-- ========================================
-- 5. CLEANUP FUNCTIONS
-- ========================================

-- Function to cleanup expired magic links
CREATE OR REPLACE FUNCTION cleanup_expired_magic_links()
RETURNS void AS $$
BEGIN
    DELETE FROM magic_links 
    WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old rate limit attempts
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limit_attempts 
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() 
    OR invalidated_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old audit logs (keep 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. AUTOMATIC CLEANUP TRIGGERS
-- ========================================

-- Note: For automatic cleanup, you can set up cron jobs or use pg_cron extension
-- Example: SELECT cron.schedule('cleanup-expired-magic-links', '0 */6 * * *', 'SELECT cleanup_expired_magic_links()');

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on tables
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Service role has full access to all tables
CREATE POLICY "Service role can manage magic_links" ON magic_links
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage user_sessions" ON user_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage rate_limit_attempts" ON rate_limit_attempts
    FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ========================================
-- 8. GRANT PERMISSIONS
-- ========================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON magic_links TO authenticated;
GRANT SELECT ON user_sessions TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- Service role needs all permissions (already has them by default)

-- ========================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE magic_links IS 'Stores passwordless magic link tokens for authentication';
COMMENT ON TABLE user_sessions IS 'Stores active user sessions with JWT tokens';
COMMENT ON TABLE audit_logs IS 'HIPAA-compliant audit trail for all authentication events';
COMMENT ON TABLE rate_limit_attempts IS 'Tracks rate limit attempts for DDoS protection';

COMMENT ON COLUMN magic_links.token IS 'Cryptographically secure UUID v4 token';
COMMENT ON COLUMN magic_links.used_at IS 'Timestamp when token was used (prevents reuse)';
COMMENT ON COLUMN user_sessions.session_token IS 'JWT session token';
COMMENT ON COLUMN user_sessions.invalidated_at IS 'Timestamp when session was logged out';
COMMENT ON COLUMN audit_logs.event_category IS 'Category for filtering and reporting';
COMMENT ON COLUMN rate_limit_attempts.identifier IS 'Email, IP, or token being rate limited';

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Run cleanup functions manually if needed:
-- SELECT cleanup_expired_magic_links();
-- SELECT cleanup_old_rate_limits();
-- SELECT cleanup_expired_sessions();

