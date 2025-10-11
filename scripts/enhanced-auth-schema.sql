-- ============================================
-- ENHANCED AUTHENTICATION SYSTEM SCHEMA
-- Adapted from healthcare app best practices
-- for TaskLinker platform
-- ============================================

-- ===========================================
-- 0. CLEANUP (Makes script idempotent - safe to run multiple times)
-- ===========================================

-- Drop existing views first (if they exist)
DROP VIEW IF EXISTS auth_activity_recent CASCADE;
DROP VIEW IF EXISTS active_sessions_summary CASCADE;
DROP VIEW IF EXISTS rate_limit_status CASCADE;

-- Drop existing functions (if they exist)
DROP FUNCTION IF EXISTS cleanup_expired_magic_links() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_sessions() CASCADE;
DROP FUNCTION IF EXISTS check_rate_limit(VARCHAR, VARCHAR, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS log_auth_event(UUID, VARCHAR, VARCHAR, VARCHAR, BOOLEAN, TEXT, INET, TEXT, JSONB) CASCADE;

-- Drop existing tables (CASCADE will automatically drop all policies, indexes, constraints)
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS auth_audit_log CASCADE;
DROP TABLE IF EXISTS auth_rate_limits CASCADE;
DROP TABLE IF EXISTS magic_links CASCADE;

-- Note: CASCADE automatically removes:
-- - All policies on these tables
-- - All indexes on these tables
-- - All constraints on these tables
-- - All triggers on these tables
-- So we don't need to explicitly drop policies!

-- ===========================================
-- 1. MAGIC LINKS TABLE (Server-Controlled)
-- ===========================================
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token TEXT NOT NULL UNIQUE, -- UUID v4 token
  type VARCHAR(50) NOT NULL CHECK (type IN ('login', 'signup')),
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('freelancer', 'client', 'admin')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE, -- NULL = unused, timestamp = used (atomic single-use)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB, -- Store additional context (IP, user agent, etc.)
  
  -- Indexes for performance
  CONSTRAINT magic_links_token_unique UNIQUE (token)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON magic_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_magic_links_used_at ON magic_links(used_at);
CREATE INDEX IF NOT EXISTS idx_magic_links_email_created ON magic_links(email, created_at DESC);

-- Cleanup old magic links (run this periodically via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_magic_links()
RETURNS void AS $$
BEGIN
  DELETE FROM magic_links 
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 2. AUTH RATE LIMITS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- Email for magic link requests, token for verification
  action VARCHAR(50) NOT NULL CHECK (action IN ('magic_link_request', 'magic_link_verification')),
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  -- Composite unique constraint
  CONSTRAINT auth_rate_limits_identifier_action_unique UNIQUE (identifier, action)
);

-- Index for fast rate limit checks
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON auth_rate_limits(identifier, action);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier VARCHAR(255),
  p_action VARCHAR(50),
  p_max_attempts INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_record RECORD;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get existing rate limit record
  SELECT * INTO v_record
  FROM auth_rate_limits
  WHERE identifier = p_identifier AND action = p_action
  FOR UPDATE;
  
  -- If blocked, check if block expired
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > NOW() THEN
    RETURN FALSE; -- Still blocked
  END IF;
  
  -- If no record or window expired, reset
  IF v_record IS NULL OR v_record.first_attempt_at < v_window_start THEN
    INSERT INTO auth_rate_limits (identifier, action, attempt_count, first_attempt_at, last_attempt_at)
    VALUES (p_identifier, p_action, 1, NOW(), NOW())
    ON CONFLICT (identifier, action) DO UPDATE
    SET attempt_count = 1, first_attempt_at = NOW(), last_attempt_at = NOW(), blocked_until = NULL;
    RETURN TRUE;
  END IF;
  
  -- Check if exceeded limit
  IF v_record.attempt_count >= p_max_attempts THEN
    -- Block for 1 hour
    UPDATE auth_rate_limits
    SET blocked_until = NOW() + INTERVAL '1 hour'
    WHERE identifier = p_identifier AND action = p_action;
    RETURN FALSE;
  END IF;
  
  -- Increment attempt count
  UPDATE auth_rate_limits
  SET attempt_count = attempt_count + 1, last_attempt_at = NOW()
  WHERE identifier = p_identifier AND action = p_action;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 3. AUTH AUDIT LOG TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  action VARCHAR(100) NOT NULL, -- 'magic_link_sent', 'magic_link_verified', 'login_success', 'login_failed', etc.
  user_type VARCHAR(50),
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_email ON auth_audit_log(email);
CREATE INDEX IF NOT EXISTS idx_audit_action ON auth_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON auth_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_success ON auth_audit_log(success);

-- Function to log auth events
CREATE OR REPLACE FUNCTION log_auth_event(
  p_user_id UUID,
  p_email VARCHAR(255),
  p_action VARCHAR(100),
  p_user_type VARCHAR(50),
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO auth_audit_log (
    user_id, email, action, user_type, success, 
    error_message, ip_address, user_agent, metadata
  )
  VALUES (
    p_user_id, p_email, p_action, p_user_type, p_success,
    p_error_message, p_ip_address, p_user_agent, p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 4. USER SESSIONS TABLE (Optional - for JWT tracking)
-- ===========================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  user_type VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for session management
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < NOW() OR (is_active = FALSE AND created_at < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Magic links: Only service role can access
CREATE POLICY "Service role can manage magic links" ON magic_links FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Rate limits: Only service role can access
CREATE POLICY "Service role can manage rate limits" ON auth_rate_limits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Audit log: Admins can read, service role can write
CREATE POLICY "Admins can read audit logs" ON auth_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_type = 'admin'
    )
  );

CREATE POLICY "Service role can write audit logs" ON auth_audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Sessions: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage sessions" ON user_sessions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ===========================================
-- 6. GRANT PERMISSIONS
-- ===========================================

-- Grant service role full access
GRANT ALL ON magic_links TO service_role;
GRANT ALL ON auth_rate_limits TO service_role;
GRANT ALL ON auth_audit_log TO service_role;
GRANT ALL ON user_sessions TO service_role;

-- Grant authenticated users limited access
GRANT SELECT ON auth_audit_log TO authenticated;
GRANT SELECT ON user_sessions TO authenticated;

-- ===========================================
-- 7. HELPFUL VIEWS FOR ADMIN DASHBOARD
-- ===========================================

-- View: Recent auth activity
CREATE OR REPLACE VIEW auth_activity_recent AS
SELECT 
  id,
  email,
  action,
  user_type,
  success,
  error_message,
  ip_address,
  created_at
FROM auth_audit_log
ORDER BY created_at DESC
LIMIT 1000;

-- View: Active sessions summary
CREATE OR REPLACE VIEW active_sessions_summary AS
SELECT 
  u.id as user_id,
  u.email,
  u.user_type,
  u.name,
  COUNT(s.id) as active_session_count,
  MAX(s.last_activity_at) as last_activity
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = TRUE AND s.expires_at > NOW()
GROUP BY u.id, u.email, u.user_type, u.name;

-- View: Rate limit status
CREATE OR REPLACE VIEW rate_limit_status AS
SELECT 
  identifier,
  action,
  attempt_count,
  first_attempt_at,
  last_attempt_at,
  blocked_until,
  CASE 
    WHEN blocked_until > NOW() THEN 'BLOCKED'
    ELSE 'ACTIVE'
  END as status
FROM auth_rate_limits
WHERE last_attempt_at > NOW() - INTERVAL '24 hours';

-- ===========================================
-- 8. INITIAL DATA / TESTING
-- ===========================================

-- Add comment for documentation
COMMENT ON TABLE magic_links IS 'Server-controlled magic link tokens for passwordless authentication';
COMMENT ON TABLE auth_rate_limits IS 'Rate limiting for authentication attempts to prevent abuse';
COMMENT ON TABLE auth_audit_log IS 'Complete audit trail of all authentication events';
COMMENT ON TABLE user_sessions IS 'Active JWT sessions for logged-in users';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Enhanced authentication schema created successfully!';
  RAISE NOTICE '📊 Tables created: magic_links, auth_rate_limits, auth_audit_log, user_sessions';
  RAISE NOTICE '🔒 Row Level Security (RLS) enabled';
  RAISE NOTICE '⚡ Indexes created for optimal performance';
  RAISE NOTICE '🛡️ Rate limiting functions ready';
  RAISE NOTICE '📝 Audit logging functions ready';
END $$;

