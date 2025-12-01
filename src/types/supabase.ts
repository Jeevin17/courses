export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_settings: {
                Row: {
                    user_id: string
                    theme: string
                    notifications_enabled: boolean
                    focus_mode_duration: number
                }
                Insert: {
                    user_id: string
                    theme?: string
                    notifications_enabled?: boolean
                    focus_mode_duration?: number
                }
                Update: {
                    user_id?: string
                    theme?: string
                    notifications_enabled?: boolean
                    focus_mode_duration?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "user_settings_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            system_settings: {
                Row: {
                    key: string
                    value: string | null
                }
                Insert: {
                    key: string
                    value?: string | null
                }
                Update: {
                    key?: string
                    value?: string | null
                }
                Relationships: []
            }
            user_progress: {
                Row: {
                    id: string
                    user_id: string
                    course_id: string
                    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
                    completed_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    course_id: string
                    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
                    completed_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    course_id?: string
                    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
                    completed_at?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_progress_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_: string]: never
        }
        Functions: {
            [_: string]: never
        }
        Enums: {
            [_: string]: never
        }
        CompositeTypes: {
            [_: string]: never
        }
    }
}
