// types/supabase.ts
export type InteractionType = 'email' | 'insight' | 'transcription' | 'action' | 'command';

export interface Interaction {
  id: string;
  user_id: string;
  type: InteractionType;
  body: string;
  action: string | null;
  comments: string | null;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface Database {
  public: {
    Tables: {
      interactions: {
        Row: Interaction;
        Insert: Omit<Interaction, 'id' | 'user_id' | 'timestamp'>;
        Update: Partial<Omit<Interaction, 'id' | 'user_id'>>;
      };
      // Add other tables as needed
    };
  };
}