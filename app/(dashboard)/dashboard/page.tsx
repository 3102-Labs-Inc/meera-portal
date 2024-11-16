// app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User, MessageSquare, Clock, Settings, BellRing, Sparkles, Link as LinkIcon } from 'lucide-react'
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
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-pulse mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Loading your portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-xl font-bold">Meera Portal</div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-gray-500">Verified Account</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {interactions.length === 0 ? (
                <div className="text-center py-6">
                  <BellRing className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-2">No recent activity</p>
                  <p className="text-xs text-gray-400">
                    Your recent Meera interactions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interactions.slice(0, 3).map((interaction) => (
                    <div key={interaction.id} className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 mt-1" />
                      <div>
                        <p className="text-sm">{interaction.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(interaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Connect Meera Device
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactions List */}
        <Card>
          <CardHeader>
            <CardTitle>All Interactions</CardTitle>
            <CardDescription>Complete history of your Meera interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {interactions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Once your Meera device is connected, your meeting interactions will appear here automatically.
                </p>
                <Button variant="outline">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Connect Your Device
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="border-b pb-4">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 mt-1" />
                      <div>
                        <p>{interaction.content}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(interaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}