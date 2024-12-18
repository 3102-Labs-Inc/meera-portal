// app/(dashboard)/monitor/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Brain, MessageSquare, LightbulbIcon, Activity } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface Transcript {
  id: string
  timestamp: Date
  speaker: string
  text: string
  confidence: number
}

interface StateUpdate {
  id: string
  timestamp: Date
  currentState: string
  metadata: Record<string, any>
  confidence: number
}

interface SuggestedAction {
  id: string
  action: string
  confidence: number
  context: string
  priority: 'low' | 'medium' | 'high'
}

export default function MonitorPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [currentState, setCurrentState] = useState<StateUpdate | null>(null)
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Simulated WebSocket connections - replace with actual implementations
    const connectToDeepgram = () => {
      // Replace with actual Deepgram WebSocket connection
      console.log('Connecting to Deepgram...')
    }

    const connectToStateService = () => {
      // Replace with actual AWS state service connection
      console.log('Connecting to State Service...')
    }

    connectToDeepgram()
    connectToStateService()

    return () => {
      // Cleanup connections
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 p-6 bg-gradient-to-r from-black to-gray-800 rounded-lg text-white">
          <h1 className="text-2xl font-bold mb-2">Live Monitor</h1>
          <p className="text-gray-300">Real-time transcription and state monitoring</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Current State Card */}
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Current State
                  <Badge 
                    variant={isConnected ? "default" : "destructive"}
                    className="ml-auto"
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {currentState ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">Current State:</span>
                          <span className="text-xs text-gray-500">
                            {currentState.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-lg font-semibold mb-2">{currentState.currentState}</p>
                        <div className="space-y-2">
                          {Object.entries(currentState.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-600">{key}:</span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex items-center">
                          <Activity className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            Confidence: {(currentState.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Brain className="h-8 w-8 mb-2 opacity-50" />
                      <p>Waiting for state updates...</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Suggested Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LightbulbIcon className="h-5 w-5" />
                  Suggested Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {suggestedActions.length > 0 ? (
                      suggestedActions.map((action) => (
                        <div 
                          key={action.id} 
                          className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium">{action.action}</span>
                            <Badge variant={
                              action.priority === 'high' ? 'destructive' :
                              action.priority === 'medium' ? 'default' :
                              'secondary'
                            }>
                              {action.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{action.context}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Confidence: {(action.confidence * 100).toFixed(1)}%
                            </span>
                            <Button variant="outline" size="sm">Execute</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[100px] text-gray-500">
                        <LightbulbIcon className="h-8 w-8 mb-2 opacity-50" />
                        <p>No suggested actions available</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Transcript */}
          <Card className="h-[700px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Live Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {transcripts.length > 0 ? (
                    transcripts.map((transcript) => (
                      <div 
                        key={transcript.id}
                        className="p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium">{transcript.speaker}</span>
                          <span className="text-xs text-gray-500">
                            {transcript.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-900">{transcript.text}</p>
                        <div className="mt-1 flex items-center">
                          <Activity className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Confidence: {(transcript.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                      <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                      <p>Waiting for transcripts...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}