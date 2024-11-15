// lib/supabase/utils.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export async function fetchInteractions() {
  const supabase = createClientComponentClient<Database>()
  
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .order('timestamp', { ascending: false })
  
  if (error) {
    console.error('Error fetching interactions:', error)
    return []
  }
  
  return data
}

export async function insertInteraction(content: string, type: 'transcription' | 'llm_response') {
  const supabase = createClientComponentClient<Database>()
  
  const { data, error } = await supabase
    .from('interactions')
    .insert([
      {
        content,
        type,
        timestamp: new Date().toISOString(),
      }
    ])
    .select()
  
  if (error) {
    console.error('Error inserting interaction:', error)
    return null
  }
  
  return data[0]
}