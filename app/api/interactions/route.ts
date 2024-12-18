// app/api/interactions/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const data = await request.json()

    const {
      type = 'transcription',
      body,
      action = null,
      comments = null,
      metadata = {}
    } = data

    if (!body) {
      return NextResponse.json(
        { error: 'Body is required' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data: interaction, error } = await supabase
      .from('interactions')
      .insert([
        {
          type,
          body,
          action,
          comments,
          metadata,
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

    return NextResponse.json({ success: true, data: interaction })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: interactions, error } = await supabase
      .from('interactions')
      .select('*')
      .order('timestamp', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch interactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: interactions })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}