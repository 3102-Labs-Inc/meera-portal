// app/api/get-token/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })

    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      token: session.access_token,
      user: session.user
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get token' },
      { status: 500 }
    )
  }
}