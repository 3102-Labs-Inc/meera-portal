// types/supabase.ts
export type Interaction = {
    id: string
    user_id: string
    content: string
    type: 'transcription' | 'llm_response'
    timestamp: string
    metadata: Record<string, any>
  }
  
  export type Profile = {
    id: string
    first_server_id: string | null
    created_at: string
    updated_at: string
  }
  
  export type Database = {
    public: {
      Tables: {
        interactions: {
          Row: Interaction
          Insert: Omit<Interaction, 'id' | 'user_id'>
          Update: Partial<Omit<Interaction, 'id' | 'user_id'>>
        }
        profiles: {
          Row: Profile
          Insert: Omit<Profile, 'created_at' | 'updated_at'>
          Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
        }
      }
    }
  }