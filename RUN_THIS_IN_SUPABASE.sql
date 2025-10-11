-- ========================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- ========================================

-- 1. Create magic_links table
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

CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON magic_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_magic_links_type ON magic_links(type);

-- 2. Create user_sessions table
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

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_invalidated ON user_sessions(invalidated_at) WHERE invalidated_at IS NULL;

-- 3. Create audit_logs table
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_category ON audit_logs(event_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON audit_logs(email);

-- 4. Create rate_limit_attempts table
CREATE TABLE IF NOT EXISTS rate_limit_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_action ON rate_limit_attempts(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at ON rate_limit_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON rate_limit_attempts(ip_address);

-- 5. Enable RLS (Row Level Security)
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (Service role has full access)
DROP POLICY IF EXISTS "Service role can manage magic_links" ON magic_links;
CREATE POLICY "Service role can manage magic_links" ON magic_links
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage user_sessions" ON user_sessions;
CREATE POLICY "Service role can manage user_sessions" ON user_sessions
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage audit_logs" ON audit_logs;
CREATE POLICY "Service role can manage audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage rate_limit_attempts" ON rate_limit_attempts;
CREATE POLICY "Service role can manage rate_limit_attempts" ON rate_limit_attempts
    FOR ALL USING (auth.role() = 'service_role');

-- Done! You should see "Success. No rows returned" if everything worked.

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- 1. Check if tables exist in PostgreSQL
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('magic_links', 'user_sessions', 'audit_logs', 'rate_limit_attempts');

-- 2. Check column details for magic_links
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'magic_links'
ORDER BY ordinal_position;

-- 3. Test direct insert (bypass PostgREST) - NOTE: Using correct column names!
INSERT INTO magic_links (email, token, type, user_type, expires_at, used_at) 
VALUES ('test@debug.com', 'debug-token-123', 'signup', 'freelancer', NOW() + INTERVAL '1 hour', NULL);

-- 4. Check if insert worked
SELECT * FROM magic_links WHERE email = 'test@debug.com';

-- 5. Test PostgREST access
SELECT COUNT(*) as postgrest_accessible FROM magic_links;

-- 6. Clean up test data
DELETE FROM magic_links WHERE email = 'test@debug.com';
