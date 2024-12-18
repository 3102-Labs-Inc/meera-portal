// app/api/logs/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const log = await request.json()
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized', details: authError },
        { status: 401 }
      )
    }

    // Log the user ID for debugging
    console.log('Authenticated user ID:', user.id)

    // Store in Supabase with explicit user_id
    const { data, error: insertError } = await supabase
      .from('interactions')
      .insert({
        user_id: user.id,
        type: log.type,
        body: log.message,
        metadata: log.metadata || {},
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert log', details: insertError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      user_id: user.id  // Include this for verification
    })
  } catch (error) {
    console.error('Error processing log:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: authError },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Select error:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error },
      { status: 500 }
    )
  }
}