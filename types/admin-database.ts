// TypeScript types for admin-specific database tables

export interface AdminSession {
    id: string
    admin_id: string
    session_token: string
    ip_address: string | null
    user_agent: string | null
    is_active: boolean
    expires_at: string
    created_at: string
    last_accessed_at: string
  }
  
  export interface AdminActivityLog {
    id: string
    admin_id: string | null
    action_type: "create" | "update" | "delete" | "view" | "export" | "login" | "logout"
    resource_type: "user" | "task" | "payment" | "dispute" | "settings"
    resource_id: string | null
    description: string
    old_values: any | null
    new_values: any | null
    ip_address: string | null
    user_agent: string | null
    session_id: string | null
    created_at: string
  }
  
  export interface PlatformAnalytics {
    id: string
    date: string
    hour: number | null
    total_users: number
    new_users_today: number
    active_users_today: number
    freelancers_count: number
    clients_count: number
    verified_users_count: number
    total_tasks: number
    new_tasks_today: number
    active_tasks: number
    completed_tasks_today: number
    cancelled_tasks_today: number
    total_revenue: number
    revenue_today: number
    platform_fees_today: number
    pending_payments: number
    new_applications_today: number
    messages_sent_today: number
    reviews_submitted_today: number
    avg_response_time_ms: number
    error_rate: number
    created_at: string
  }
  
  export interface UserVerificationRequest {
    id: string
    user_id: string
    verification_type: "identity" | "business" | "professional"
    documents: any
    submitted_data: any | null
    status: "pending" | "approved" | "rejected" | "requires_more_info"
    reviewed_by: string | null
    review_notes: string | null
    reviewed_at: string | null
    created_at: string
    updated_at: string
  }
  
  export type UserType = "freelancer" | "client" | "admin"
  
  export interface FeatureFlag {
    id: string
    name: string
    description: string | null
    is_enabled: boolean
    target_user_types: UserType[] | null
    target_percentage: number
    target_conditions: any | null
    created_by: string | null
    created_at: string
    updated_at: string
    expires_at: string | null
  }
  
  export interface SystemHealthMetric {
    id: string
    metric_name: string
    metric_value: number
    metric_unit: string | null
    service_name: string | null
    environment: string
    metadata: any | null
    recorded_at: string
  }
  
  export interface ContentModerationQueue {
    id: string
    content_type: "task" | "profile" | "review" | "message"
    content_id: string
    reporter_id: string | null
    reason: "spam" | "inappropriate" | "fraud" | "copyright"
    description: string | null
    severity: "low" | "medium" | "high" | "critical"
    status: "pending" | "reviewing" | "approved" | "rejected" | "escalated"
    assigned_to: string | null
    moderator_notes: string | null
    action_taken: string | null
    created_at: string
    updated_at: string
    resolved_at: string | null
  }
  
  export interface EmailCampaign {
    id: string
    name: string
    subject: string
    template_name: string | null
    target_user_types: UserType[] | null
    target_conditions: any | null
    html_content: string | null
    text_content: string | null
    status: "draft" | "scheduled" | "sending" | "sent" | "cancelled"
    scheduled_at: string | null
    sent_at: string | null
    total_recipients: number
    delivered_count: number
    opened_count: number
    clicked_count: number
    bounced_count: number
    unsubscribed_count: number
    created_by: string | null
    created_at: string
    updated_at: string
  }
  
  export interface UserSegment {
    id: string
    name: string
    description: string | null
    conditions: any
    user_count: number
    last_calculated_at: string | null
    created_by: string | null
    created_at: string
    updated_at: string
  }
  
  export interface ApiUsageLog {
    id: string
    user_id: string | null
    endpoint: string
    method: string
    ip_address: string | null
    user_agent: string | null
    request_size: number | null
    response_size: number | null
    response_time_ms: number | null
    status_code: number | null
    rate_limit_key: string | null
    requests_count: number
    created_at: string
  }
  
  // Admin dashboard data types
  export interface DashboardStats {
    users: {
      total: number
      new_this_period: number
      active_7d: number
      verified: number
    }
    tasks: {
      total: number
      new_this_period: number
      active: number
      completed_this_period: number
    }
    financial: {
      total_revenue: number
      revenue_this_period: number
      pending_payments: number
      total_transactions: number
    }
    engagement: {
      new_applications: number
      new_reviews: number
      active_disputes: number
      avg_task_completion_days: number
    }
  }
  
  export interface UserGrowthData {
    date: string
    new_users: number
    cumulative_users: number
    new_freelancers: number
    new_clients: number
  }
  
  export interface RevenueAnalytics {
    date: string
    daily_revenue: number
    cumulative_revenue: number
    transaction_count: number
    avg_transaction_value: number
  }
  
  export interface PlatformHealthMetrics {
    system_status: string
    uptime_percentage: number
    active_users_24h: number
    tasks_created_24h: number
    payments_processed_24h: number
    avg_response_time_ms: number
    error_rate_percentage: number
    database_connections: number
    pending_disputes: number
    unread_support_tickets: number
    storage_usage_gb: number
  }
  