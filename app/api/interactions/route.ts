// app/api/interactions/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Get a service role client instead of using cookies
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        options: {
          db: { schema: 'public' }
        }
      }
    )

    const data = await request.json()

    // Validate required fields
    const {
      content,
      audio_url = null,
      type = 'transcription',
      metadata = {}
    } = data

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Insert with public access
    const { data: interaction, error } = await supabase
      .from('interactions')
      .insert([
        {
          content,
          type,
          metadata,
          audio_url,
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save interaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: interaction 
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}