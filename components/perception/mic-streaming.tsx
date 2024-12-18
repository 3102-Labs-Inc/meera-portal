// components/perception/mic-streaming.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, Settings, Loader2 } from 'lucide-react'

interface Log {
  id: string
  timestamp: Date
  type: 'connection' | 'websocket' | 'error'
  message: string
  metadata?: Record<string, any>
}

const generateUniqueId = (() => {
  let counter = 0;
  const prefix = Math.random().toString(36).substring(2, 9);
  return () => {
    counter += 1;
    return `${prefix}-${Date.now()}-${counter}`;
  };
})();

const MicStreaming: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080')
  const [hasPermission, setHasPermission] = useState(false)
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected')
  const [isConnecting, setIsConnecting] = useState(false)
  const [logs, setLogs] = useState<Log[]>([])
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)

  const addLog = (type: Log['type'], message: string, metadata?: Record<string, any>) => {
    const newLog = {
      id: generateUniqueId(),
      timestamp: new Date(),
      type,
      message,
      metadata
    };
    
    setLogs(prev => {
      // Keep last 100 logs
      const newLogs = [...prev, newLog]
      if (newLogs.length > 100) {
        return newLogs.slice(-100)
      }
      return newLogs
    });
  }

  // ... keep your existing audio processing functions ...

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      addLog('websocket', 'Received message from server', data)
    } catch (error) {
      // If it's not JSON, treat it as a plain message
      addLog('websocket', event.data)
    }
  }

    // Update the WebSocket connection to use Deepgram's API
  const setupWebSocket = () => {
    const deepgramUrl = 'wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1';
    
    const ws = new WebSocket(deepgramUrl, {
      headers: {
        Authorization: `0aa4af07b750d62ab882eae5e873328292b389cb`
      }
    });
    wsRef.current = ws;

    ws.onopen = () => {
      addLog('success', 'Connected to Deepgram');
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const received = JSON.parse(event.data);
        if (received.channel && received.channel.alternatives) {
          const transcript = received.channel.alternatives[0].transcript;
          if (transcript) {
            // Here we can emit the transcript to our Monitor page
            // We can use a state management solution or WebSocket to handle this
            console.log('Transcript:', transcript);
          }
        }
      } catch (error) {
        console.error('Error parsing Deepgram response:', error);
      }
    };
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        addLog('connection', 'Starting recording...')
        setupWebSocket()
        // ... rest of your recording start logic ...
      } catch (error) {
        addLog('error', 'Failed to start recording')
        setWsStatus('error')
        setIsRecording(false)
      }
    } else {
      try {
        // ... your existing stop recording logic ...
        addLog('connection', 'Recording stopped')
      } catch (error) {
        addLog('error', 'Error while stopping recording')
      }
    }
  }

  const getLogStyle = (type: Log['type']) => {
    switch (type) {
      case 'websocket':
        return 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'error':
        return 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'border-gray-500 bg-gray-50 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="stream">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stream">
            <Mic className="mr-2 h-4 w-4" />
            Stream Audio
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stream">
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-800">
              <canvas 
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-full"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            <div className="flex justify-center">
              <Button
                size="lg"
                disabled={!hasPermission}
                onClick={toggleRecording}
                className={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                {isRecording ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full bg-white animate-pulse"></div>
                    Stop Recording
                  </div>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">WebSocket Server URL</h3>
              <div className="space-y-2">
                <Input
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  placeholder="ws://localhost:8080"
                />
                <div className="flex items-center">
                  <div 
                    className={`w-2 h-2 rounded-full mr-2 ${
                      wsStatus === 'connected' ? 'bg-green-500' : 
                      wsStatus === 'error' ? 'bg-red-500' : 
                      'bg-gray-500'
                    }`}
                  />
                  <span className="text-sm text-gray-500">
                    {wsStatus === 'connected' ? 'Connected' : 
                     wsStatus === 'error' ? 'Connection Error' : 
                     'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Combined Logs Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">System Logs</h3>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded border-l-4 ${getLogStyle(log.type)}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-medium uppercase ${
                          log.type === 'websocket' ? 'text-blue-600' :
                          log.type === 'error' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{log.message}</p>
                      {log.metadata && (
                        <pre className="mt-1 text-xs bg-black/5 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MicStreaming