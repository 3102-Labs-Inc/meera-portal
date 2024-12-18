// app/(dashboard)/logs/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Brain, AlertCircle, Info } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Log {
  id: string
  timestamp: string
  type: 'llm' | 'system' | 'error'
  message: string
  metadata?: Record<string, any>
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Using Supabase directly instead of fetch
        const { data, error: supabaseError } = await supabase
          .from('interactions')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100)

        if (supabaseError) {
          throw supabaseError
        }

        setLogs(data || [])
      } catch (err) {
        console.error('Error fetching logs:', err)
        setError('Failed to load logs')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const getLogIcon = (type: Log['type']) => {
    switch (type) {
      case 'llm':
        return <Brain className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getLogStyle = (type: Log['type']) => {
    switch (type) {
      case 'llm':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-pulse text-gray-400">Loading logs...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-[400px] text-red-500">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            System Logs
          </CardTitle>
          <CardDescription>
            Real-time system and LLM processing logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] rounded-md border p-4">
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No logs found
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start space-x-3 rounded-lg p-3 ${getLogStyle(log.type)}`}
                  >
                    {getLogIcon(log.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {log.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <pre className="mt-2 rounded bg-black/10 p-2 text-xs overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}