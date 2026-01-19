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
        }
      }
      votes: {
        Row: {
          id: string
          item_id: string
          voter_email: string | null
          voter_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          voter_email?: string | null
          voter_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          voter_email?: string | null
          voter_token?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Project = Database['public']['Tables']['projects']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type ItemStatus = Item['status']
