import { CategoryColor } from '@/lib/category-colors'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Type aliases for new enums
export type IntegrationSourceType = 'slack' | 'intercom' | 'app_store' | 'zendesk' | 'email'
export type IntegrationStatus = 'active' | 'paused' | 'error' | 'disconnected'
export type RawMessageStatus = 'pending' | 'processing' | 'processed' | 'skipped' | 'error'
export type FeedbackType = 'feature_request' | 'bug_report' | 'complaint' | 'praise' | 'question'
export type Sentiment = 'positive' | 'negative' | 'neutral' | 'mixed'
export type Urgency = 'low' | 'normal' | 'high' | 'critical'
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'merged'
export type ClusterReviewStatus = 'pending' | 'reviewed' | 'dismissed'
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type ItemSourceType = 'manual' | 'public_submission' | 'ai_extracted'

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          slug: string
          name: string
          owner_id: string
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          owner_id: string
          settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          owner_id?: string
          settings?: Json
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: 'considering' | 'planned' | 'in_progress' | 'shipped'
          vote_count: number
          shipped_at: string | null
          created_at: string
          category_id: string | null
          source_type: ItemSourceType
          source_feedback_id: string | null
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: 'considering' | 'planned' | 'in_progress' | 'shipped'
          vote_count?: number
          shipped_at?: string | null
          created_at?: string
          category_id?: string | null
          source_type?: ItemSourceType
          source_feedback_id?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: 'considering' | 'planned' | 'in_progress' | 'shipped'
          vote_count?: number
          shipped_at?: string | null
          created_at?: string
          category_id?: string | null
          source_type?: ItemSourceType
          source_feedback_id?: string | null
        }
      }
      votes: {
        Row: {
          id: string
          item_id: string
          voter_email: string | null
          voter_token: string | null
          created_at: string
          notify_on_ship: boolean
        }
        Insert: {
          id?: string
          item_id: string
          voter_email?: string | null
          voter_token?: string | null
          created_at?: string
          notify_on_ship?: boolean
        }
        Update: {
          id?: string
          item_id?: string
          voter_email?: string | null
          voter_token?: string | null
          created_at?: string
          notify_on_ship?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          project_id: string
          name: string
          color: CategoryColor
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          color?: CategoryColor
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          color?: CategoryColor
          created_at?: string
        }
      }
      notification_logs: {
        Row: {
          id: string
          item_id: string
          voter_email: string
          sent_at: string
        }
        Insert: {
          id?: string
          item_id: string
          voter_email: string
          sent_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          voter_email?: string
          sent_at?: string
        }
      }
      integration_sources: {
        Row: {
          id: string
          project_id: string
          type: IntegrationSourceType
          name: string
          status: IntegrationStatus
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          config: Json
          last_sync_at: string | null
          last_error: string | null
          message_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: IntegrationSourceType
          name: string
          status?: IntegrationStatus
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          config?: Json
          last_sync_at?: string | null
          last_error?: string | null
          message_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: IntegrationSourceType
          name?: string
          status?: IntegrationStatus
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          config?: Json
          last_sync_at?: string | null
          last_error?: string | null
          message_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      raw_messages: {
        Row: {
          id: string
          integration_source_id: string
          project_id: string
          external_id: string
          external_thread_id: string | null
          external_user_id: string | null
          external_user_name: string | null
          external_user_email: string | null
          content: string
          content_html: string | null
          channel_name: string | null
          metadata: Json
          status: RawMessageStatus
          processed_at: string | null
          error_message: string | null
          message_timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          integration_source_id: string
          project_id: string
          external_id: string
          external_thread_id?: string | null
          external_user_id?: string | null
          external_user_name?: string | null
          external_user_email?: string | null
          content: string
          content_html?: string | null
          channel_name?: string | null
          metadata?: Json
          status?: RawMessageStatus
          processed_at?: string | null
          error_message?: string | null
          message_timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          integration_source_id?: string
          project_id?: string
          external_id?: string
          external_thread_id?: string | null
          external_user_id?: string | null
          external_user_name?: string | null
          external_user_email?: string | null
          content?: string
          content_html?: string | null
          channel_name?: string | null
          metadata?: Json
          status?: RawMessageStatus
          processed_at?: string | null
          error_message?: string | null
          message_timestamp?: string
          created_at?: string
        }
      }
      feedback_clusters: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          centroid_embedding: number[] | null
          member_count: number
          total_mentions: number
          linked_item_id: string | null
          review_status: ClusterReviewStatus
          reviewed_at: string | null
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          centroid_embedding?: number[] | null
          member_count?: number
          total_mentions?: number
          linked_item_id?: string | null
          review_status?: ClusterReviewStatus
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          centroid_embedding?: number[] | null
          member_count?: number
          total_mentions?: number
          linked_item_id?: string | null
          review_status?: ClusterReviewStatus
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      extracted_feedback: {
        Row: {
          id: string
          raw_message_id: string
          project_id: string
          cluster_id: string | null
          type: FeedbackType
          title: string
          description: string | null
          quote: string | null
          confidence: number
          sentiment: Sentiment | null
          urgency: Urgency
          embedding: number[] | null
          customer_name: string | null
          customer_email: string | null
          review_status: ReviewStatus
          reviewed_at: string | null
          reviewed_by: string | null
          created_item_id: string | null
          merged_into_item_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          raw_message_id: string
          project_id: string
          cluster_id?: string | null
          type: FeedbackType
          title: string
          description?: string | null
          quote?: string | null
          confidence: number
          sentiment?: Sentiment | null
          urgency?: Urgency
          embedding?: number[] | null
          customer_name?: string | null
          customer_email?: string | null
          review_status?: ReviewStatus
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_item_id?: string | null
          merged_into_item_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          raw_message_id?: string
          project_id?: string
          cluster_id?: string | null
          type?: FeedbackType
          title?: string
          description?: string | null
          quote?: string | null
          confidence?: number
          sentiment?: Sentiment | null
          urgency?: Urgency
          embedding?: number[] | null
          customer_name?: string | null
          customer_email?: string | null
          review_status?: ReviewStatus
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_item_id?: string | null
          merged_into_item_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      background_jobs: {
        Row: {
          id: string
          project_id: string | null
          type: string
          status: JobStatus
          input: Json
          output: Json
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          external_job_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          type: string
          status?: JobStatus
          input?: Json
          output?: Json
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          external_job_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          type?: string
          status?: JobStatus
          input?: Json
          output?: Json
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          external_job_id?: string | null
          created_at?: string
        }
      }
      ai_processing_logs: {
        Row: {
          id: string
          project_id: string
          operation: string
          model: string
          input_tokens: number
          output_tokens: number
          cost_cents: number
          raw_message_id: string | null
          extracted_feedback_id: string | null
          success: boolean
          error_message: string | null
          latency_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          operation: string
          model: string
          input_tokens?: number
          output_tokens?: number
          cost_cents?: number
          raw_message_id?: string | null
          extracted_feedback_id?: string | null
          success?: boolean
          error_message?: string | null
          latency_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          operation?: string
          model?: string
          input_tokens?: number
          output_tokens?: number
          cost_cents?: number
          raw_message_id?: string | null
          extracted_feedback_id?: string | null
          success?: boolean
          error_message?: string | null
          latency_ms?: number | null
          created_at?: string
        }
      }
    }
  }
}

export type Project = Database['public']['Tables']['projects']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type NotificationLog = Database['public']['Tables']['notification_logs']['Row']
export type IntegrationSource = Database['public']['Tables']['integration_sources']['Row']
export type RawMessage = Database['public']['Tables']['raw_messages']['Row']
export type FeedbackCluster = Database['public']['Tables']['feedback_clusters']['Row']
export type ExtractedFeedback = Database['public']['Tables']['extracted_feedback']['Row']
export type BackgroundJob = Database['public']['Tables']['background_jobs']['Row']
export type AIProcessingLog = Database['public']['Tables']['ai_processing_logs']['Row']

export type ItemStatus = Item['status']

export type ItemWithCategory = Item & {
  category?: Category | null
}

// Extended types with relations
export type ExtractedFeedbackWithMessage = ExtractedFeedback & {
  raw_message: RawMessage
  integration_source?: IntegrationSource
  cluster?: FeedbackCluster | null
}

export type FeedbackClusterWithMembers = FeedbackCluster & {
  extracted_feedback: ExtractedFeedback[]
  linked_item?: Item | null
}

export type IntegrationSourceWithStats = IntegrationSource & {
  pending_messages_count?: number
  processed_messages_count?: number
}

// Slack-specific config type
export interface SlackIntegrationConfig extends Record<string, unknown> {
  team_id: string
  team_name: string
  channel_ids: string[]
  channel_names?: Record<string, string>
  keywords?: string[]
  bot_user_id?: string
}

// Intercom-specific config type
export interface IntercomIntegrationConfig extends Record<string, unknown> {
  app_id: string
  inbox_ids?: string[]
  tag_ids?: string[]
}

// App Store config type
export interface AppStoreIntegrationConfig extends Record<string, unknown> {
  app_id: string
  app_name: string
  country_codes?: string[]
}
