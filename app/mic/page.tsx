'use client'

import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mic, Settings } from 'lucide-react'

export default function MicPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080')
  const [hasPermission, setHasPermission] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
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

  // Handle recording start/stop
  const toggleRecording = async () => {
    if (!isRecording) {
      // Start recording
      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      
      if (streamRef.current) {
        const source = audioCtx.createMediaStreamSource(streamRef.current)
        const analyser = audioCtx.createAnalyser()
        source.connect(analyser)
        
        // Connect to WebSocket
        wsRef.current = new WebSocket(wsUrl)
        wsRef.current.onopen = () => {
          console.log('WebSocket Connected')
        }
        
        // Start visualization
        drawWaveform(analyser)
      }
    } else {
      // Stop recording
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (audioContextRef.current) {
        await audioContextRef.current.close()
      }
    }
    setIsRecording(!isRecording)
  }

  // Update this function in your MicPage component
const drawWaveform = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current
    if (!canvas) return
  
    const ctx = canvas.getContext('2d')
    if (!ctx) return
  
    // Set a higher frequency bin count for better resolution
    analyser.fftSize = 2048
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const width = canvas.width
    const height = canvas.height
    
    const draw = () => {
      if (!isRecording) return
  
      requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)
      
      // Clear background with slight fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, width, height)
      
      // Draw waveform
      ctx.lineWidth = 3
      ctx.strokeStyle = '#00ff00' // Bright green
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
      
      // Add glow effect
      ctx.shadowBlur = 15
      ctx.shadowColor = '#00ff00'
      
      ctx.lineTo(width, height / 2)
      ctx.stroke()
      
      // Reset shadow for next frame
      ctx.shadowBlur = 0
    }
    
    draw()
  }
  
  // Save WebSocket URL
  const handleSaveUrl = () => {
    localStorage.setItem('wsUrl', wsUrl)
  }

  // Load saved URL on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('wsUrl')
    if (savedUrl) {
      setWsUrl(savedUrl)
    }
    requestPermission()
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
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <canvas 
                      ref={canvasRef}
                      width={800}
                      height={400}
                      className="w-full h-full"
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
                        placeholder="ws://localhost:8080"
                      />
                      <Button onClick={handleSaveUrl}>Save</Button>
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