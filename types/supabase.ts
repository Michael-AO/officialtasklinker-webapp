export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          user_type: "freelancer" | "client"
          avatar_url: string | null
          is_verified: boolean
          dojah_verified: boolean
          verification_type: string | null
          kyc_status: string | null
          youverify_id: string | null
          kyc_last_checked: string | null
          kyc_fail_reason: string | null
          phone: string | null
          bio: string | null
          location: string | null
          hourly_rate: number | null
          skills: string[]
          rating: number
          completed_tasks: number
          total_earned: number
          join_date: string
          last_active: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          user_type: "freelancer" | "client"
          avatar_url?: string | null
          is_verified?: boolean
          dojah_verified?: boolean
          verification_type?: string | null
          kyc_status?: string | null
          youverify_id?: string | null
          kyc_last_checked?: string | null
          kyc_fail_reason?: string | null
          phone?: string | null
          bio?: string | null
          location?: string | null
          hourly_rate?: number | null
          skills?: string[]
          rating?: number
          completed_tasks?: number
          total_earned?: number
          join_date?: string
          last_active?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          user_type?: "freelancer" | "client"
          avatar_url?: string | null
          is_verified?: boolean
          dojah_verified?: boolean
          verification_type?: string | null
          kyc_status?: string | null
          youverify_id?: string | null
          kyc_last_checked?: string | null
          kyc_fail_reason?: string | null
          phone?: string | null
          bio?: string | null
          location?: string | null
          hourly_rate?: number | null
          skills?: string[]
          rating?: number
          completed_tasks?: number
          total_earned?: number
          join_date?: string
          last_active?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string
          category: string
          subcategory: string | null
          skills_required: string[]
          budget_type: "fixed" | "hourly"
          budget_min: number
          budget_max: number
          currency: string
          duration: string
          location: string
          experience_level: string
          urgency: "low" | "normal" | "high"
          status: "draft" | "active" | "assigned" | "in_progress" | "completed" | "cancelled"
          visibility: "public" | "private"
          requirements: string[]
          questions: string[]
          attachments: string[]
          applications_count: number
          views_count: number
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description: string
          category: string
          subcategory?: string | null
          skills_required?: string[]
          budget_type: "fixed" | "hourly"
          budget_min: number
          budget_max: number
          currency?: string
          duration: string
          location?: string
          experience_level?: string
          urgency?: "low" | "normal" | "high"
          status?: "draft" | "active" | "assigned" | "in_progress" | "completed" | "cancelled"
          visibility?: "public" | "private"
          requirements?: string[]
          questions?: string[]
          attachments?: string[]
          applications_count?: number
          views_count?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string
          category?: string
          subcategory?: string | null
          skills_required?: string[]
          budget_type?: "fixed" | "hourly"
          budget_min?: number
          budget_max?: number
          currency?: string
          duration?: string
          location?: string
          experience_level?: string
          urgency?: "low" | "normal" | "high"
          status?: "draft" | "active" | "assigned" | "in_progress" | "completed" | "cancelled"
          visibility?: "public" | "private"
          requirements?: string[]
          questions?: string[]
          attachments?: string[]
          applications_count?: number
          views_count?: number
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          task_id: string
          freelancer_id: string
          proposed_budget: number
          budget_type: "fixed" | "hourly"
          estimated_duration: string
          cover_letter: string
          attachments: string[]
          status: "pending" | "accepted" | "rejected" | "withdrawn" | "interviewing"
          applied_date: string
          response_date: string | null
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          freelancer_id: string
          proposed_budget: number
          budget_type: "fixed" | "hourly"
          estimated_duration: string
          cover_letter: string
          attachments?: string[]
          status?: "pending" | "accepted" | "rejected" | "withdrawn" | "interviewing"
          applied_date?: string
          response_date?: string | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          freelancer_id?: string
          proposed_budget?: number
          budget_type?: "fixed" | "hourly"
          estimated_duration?: string
          cover_letter?: string
          attachments?: string[]
          status?: "pending" | "accepted" | "rejected" | "withdrawn" | "interviewing"
          applied_date?: string
          response_date?: string | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      escrow_accounts: {
        Row: {
          id: string
          task_id: string
          client_id: string
          freelancer_id: string | null
          amount: number
          currency: string
          status: "pending" | "funded" | "released" | "disputed" | "refunded"
          milestones: any[]
          payment_reference: string | null
          release_conditions: string | null
          dispute_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          client_id: string
          freelancer_id?: string | null
          amount: number
          currency?: string
          status?: "pending" | "funded" | "released" | "disputed" | "refunded"
          milestones?: any[]
          payment_reference?: string | null
          release_conditions?: string | null
          dispute_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          client_id?: string
          freelancer_id?: string | null
          amount?: number
          currency?: string
          status?: "pending" | "funded" | "released" | "disputed" | "refunded"
          milestones?: any[]
          payment_reference?: string | null
          release_conditions?: string | null
          dispute_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          message_type: "text" | "file" | "image" | "system"
          attachments: string[]
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          message_type?: "text" | "file" | "image" | "system"
          attachments?: string[]
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          message_type?: "text" | "file" | "image" | "system"
          attachments?: string[]
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: "task" | "application" | "payment" | "message" | "system"
          data: any | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: "task" | "application" | "payment" | "message" | "system"
          data?: any | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: "task" | "application" | "payment" | "message" | "system"
          data?: any | null
          is_read?: boolean
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          name: string
          role: "super_admin" | "admin" | "moderator"
          permissions: string[]
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: "super_admin" | "admin" | "moderator"
          permissions?: string[]
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: "super_admin" | "admin" | "moderator"
          permissions?: string[]
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "freelancer" | "client"
      task_status: "draft" | "active" | "assigned" | "in_progress" | "completed" | "cancelled"
      application_status: "pending" | "accepted" | "rejected" | "withdrawn" | "interviewing"
      escrow_status: "pending" | "funded" | "released" | "disputed" | "refunded"
    }
  }
}
