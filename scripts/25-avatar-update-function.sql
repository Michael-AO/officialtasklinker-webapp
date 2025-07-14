-- Create function to update user avatar URL (bypasses RLS)
-- This function allows the avatar upload API to update the avatar_url field
-- without being blocked by RLS policies

CREATE OR REPLACE FUNCTION update_user_avatar(user_id UUID, avatar_url TEXT)
RETURNS VOID AS $$
BEGIN
    -- Update the user's avatar_url and updated_at timestamp
    UPDATE users 
    SET 
        avatar_url = update_user_avatar.avatar_url,
        updated_at = NOW()
    WHERE id = update_user_avatar.user_id;
    
    -- Raise an exception if no rows were updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with ID % not found', user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_avatar(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_avatar(UUID, TEXT) TO service_role;

-- Test the function (optional - remove in production)
-- SELECT update_user_avatar('your-user-id-here', 'https://example.com/avatar.jpg'); 