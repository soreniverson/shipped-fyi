import { CategoryColor } from '@/lib/category-colors'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
    }
  }
}

export type Project = Database['public']['Tables']['projects']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type NotificationLog = Database['public']['Tables']['notification_logs']['Row']
export type ItemStatus = Item['status']

export type ItemWithCategory = Item & {
  category?: Category | null
}
