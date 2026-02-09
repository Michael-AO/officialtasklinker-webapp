/**
 * Server-side notification helper
 * Creates notifications that can be consumed via API and real-time subscriptions
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type NotificationType =
  | 'task'
  | 'application'
  | 'payment'
  | 'message'
  | 'system'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

/**
 * Create a notification for a user. Call from API routes after verifying session.
 * Uses service role to bypass RLS. Realtime will broadcast to subscribers if enabled.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  content: string,
  link?: string
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      content: content || title,
      message: content || title, // Keep message for backward compatibility
      link: link || null,
      is_read: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createNotification error:', error)
    return { error: error.message }
  }

  return { id: data?.id }
}
