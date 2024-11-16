'use client'

import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mic, Settings, Loader2 } from 'lucide-react'

export default function MicPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [wsUrl, setWsUrl] = useState('ws://13.232.236.7:8080')
  const [hasPermission, setHasPermission] = useState(false)
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected')
  const [isSaving, setIsSaving] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)

  // Convert Float32Array to Int16Array for PCM
  const convertFloatTo16BitPCM = (float32Array: Float32Array) => {
    const int16Array = new Int16Array(float32Array.length)
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]))
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    return int16Array
  }

  // Request microphone permission
  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setHasPermission(true)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setHasPermission(false)
    }
  }

  // Draw waveform visualization
  const drawWaveform = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    analyser.fftSize = 2048
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const width = canvas.width
    const height = canvas.height
    
    const draw = () => {
      if (!isRecording) return

      requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, width, height)
      
      ctx.lineWidth = 3
      ctx.strokeStyle = '#00ff00'
      ctx.beginPath()
      
      const sliceWidth = width / bufferLength
      let x = 0
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        
        x += sliceWidth
      }
      
      ctx.shadowBlur = 15
      ctx.shadowColor = '#00ff00'
      
      ctx.lineTo(width, height / 2)
      ctx.stroke()
      
      ctx.shadowBlur = 0
    }
    
    draw()
  }

  // Handle recording toggle
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        console.log('Starting recording...')
        
        // First establish WebSocket connection
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        
        ws.onopen = () => {
          console.log('Connected to WebSocket');
          setWsStatus('connected');
          setupAudioStream();
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsStatus('error');
        };
        
        ws.onclose = () => {
          console.log('WebSocket closed');
          setWsStatus('disconnected');
        };

        // Add timeout for connection attempt
        setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            console.error('WebSocket connection timeout')
            wsRef.current?.close()
            setWsStatus('error')
            setIsRecording(false)
          }
        }, 5000) // 5 second timeout
        
        const setupAudioStream = async () => {
          try {
            const audioCtx = new AudioContext()
            audioContextRef.current = audioCtx

            if (streamRef.current) {
              console.log('Setting up audio nodes...')
              // Create audio nodes with explicit settings
              const source = audioCtx.createMediaStreamSource(streamRef.current)
              
              const analyser = audioCtx.createAnalyser()
              analyser.fftSize = 2048
              
              // Create processor with larger buffer for better quality
              const processor = audioCtx.createScriptProcessor(4096, 1, 1)
              processorRef.current = processor
              
              console.log('Audio context state:', audioCtx.state)
              console.log('s rate:', audioCtx.sampleRate)
              
              // Connect audio nodes
              source.connect(analyser)
              analyser.connect(processor)
              processor.connect(audioCtx.destination)
              
              console.log('Audio nodes connected:', {
                sourceChannels: source.channelCount,
                processorBufferSize: processor.bufferSize
              })

              console.log('Audio nodes connected successfully')

          wsRef.current.onclose = () => {
            console.log('WebSocket Disconnected')
            setWsStatus('disconnected')
            setIsRecording(false)
          }

          wsRef.current.onerror = (error) => {
            console.error('WebSocket Error:', error)
            setWsStatus('error')
            setIsRecording(false)
          }

          wsRef.current.onmessage = (event) => {
            if (event.data === 'connected') {
              setWsStatus('connected')
            }
          }

          // Handle audio processing and streaming
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0)
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  try {
                    const pcmData = convertFloatTo16BitPCM(inputData)
                    console.log('Sending audio data:', {
                      inputDataLength: inputData.length,
                      pcmDataLength: pcmData.length,
                      wsState: wsRef.current.readyState
                    });
                    
                    // Convert ArrayBuffer to Blob for sending
                    const audioBlob = new Blob([pcmData.buffer], { type: 'audio/raw' });
                    wsRef.current.send(audioBlob);
                  } catch (err) {
                    console.error('Error sending audio data:', err)
                  }
                } else {
                  console.warn('WebSocket not ready:', wsRef.current?.readyState);
                }
              }

              // Start visualization
              drawWaveform(analyser)
              
              setIsRecording(true)
              console.log('Recording started successfully')
            } else {
              console.error('No audio stream available')
            }
          } catch (err) {
            console.error('Error setting up audio stream:', err)
            setWsStatus('error')
            setIsRecording(false)
            if (wsRef.current) {
              wsRef.current.close()
            }
          }
        }
      } catch (error) {
        console.error('Error in toggle recording:', error)
        setWsStatus('error')
        setIsRecording(false)
      }
    } else {
      console.log('Stopping recording...')
      try {
        // Stop recording
        if (processorRef.current) {
          processorRef.current.disconnect()
          processorRef.current = null
        }
        
        if (audioContextRef.current) {
          await audioContextRef.current.close()
          audioContextRef.current = null
        }
        
        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
        }
        
        setWsStatus('disconnected')
        setIsRecording(false)
        console.log('Recording stopped successfully')
      } catch (error) {
        console.error('Error stopping recording:', error)
        setIsRecording(false)
        setWsStatus('error')
      }
    }
  }

  // Save WebSocket URL
  const handleSaveUrl = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('wsUrl', wsUrl)
      // Simulate a delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      setIsSaving(false)
    }
  }

  // Load saved URL and request permission on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('wsUrl')
    if (savedUrl) {
      setWsUrl(savedUrl)
    }
    requestPermission()

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (processorRef.current) {
        processorRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Meera Audio Interface</CardTitle>
            <CardDescription>Stream audio to WebSocket server</CardDescription>
          </CardHeader>
          <CardContent>
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
                      style={{
                        imageRendering: 'pixelated'
                      }}
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
                    <div className="flex space-x-2">
                      <Input
                        value={wsUrl}
                        onChange={(e) => setWsUrl(e.target.value)}
                        placeholder="ws://13.232.236.7:8080"
                      />
                      <Button 
                        onClick={handleSaveUrl}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center mt-2">
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}