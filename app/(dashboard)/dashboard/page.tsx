// app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User, MessageSquare, Clock, Settings } from 'lucide-react'
import { fetchInteractions } from '@/lib/supabase/utils'
import type { Interaction } from '@/types/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Dashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    const loadInteractions = async () => {
      const data = await fetchInteractions()
      setInteractions(data)
    }

    getUser()
    loadInteractions()

    // Set up real-time subscription
    const channel = supabase
      .channel('interactions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'interactions' },
        () => {
          loadInteractions() // Reload interactions when changes occur
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, []) // We'll disable the exhaustive-deps warning for supabase

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Rest of your JSX remains the same */}
    </div>
  )
}