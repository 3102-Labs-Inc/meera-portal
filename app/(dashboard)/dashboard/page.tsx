'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User, MessageSquare, Clock, Settings } from 'lucide-react'

interface Interaction {
  id: string
  content: string
  type: 'transcription' | 'llm_response'
  timestamp: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
    // TODO: Fetch interactions from your API
  }, [])

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
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-gray-500">ID: {user?.id?.slice(0, 8)}...</p>
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
              <div className="space-y-4">
                {interactions.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent interactions</p>
                ) : (
                  interactions.slice(0, 3).map((interaction) => (
                    <div key={interaction.id} className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 mt-1" />
                      <div>
                        <p className="text-sm">{interaction.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(interaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>Configure your Meera instance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Configure Meera
                </Button>
                <Button variant="outline" className="w-full">
                  View API Keys
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
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No interactions yet</p>
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