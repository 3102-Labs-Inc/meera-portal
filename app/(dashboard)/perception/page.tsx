// app/(dashboard)/perception/page.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Eye, Ear, Brain, AlertCircle, Activity } from 'lucide-react'
import MicStreaming from '@/components/perception/mic-streaming'

export default function PerceptionPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 p-6 bg-gradient-to-r from-black to-gray-800 rounded-lg text-white">
          <h1 className="text-2xl font-bold mb-2">Perception Management</h1>
          <p className="text-gray-300">Control and monitor Meera's sensory inputs and processing</p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="microphone" className="space-y-6">
          <TabsList className="inline-flex h-auto p-1 gap-1 bg-gray-100 rounded-lg">
            <TabsTrigger 
              value="microphone" 
              className="inline-flex items-center px-3 py-2 rounded"
            >
              <Mic className="mr-2 h-4 w-4" />
              Microphone
            </TabsTrigger>
            <TabsTrigger 
              value="vision" 
              className="inline-flex items-center px-3 py-2 rounded"
              disabled
            >
              <Eye className="mr-2 h-4 w-4" />
              Vision
            </TabsTrigger>
            <TabsTrigger 
              value="environment" 
              className="inline-flex items-center px-3 py-2 rounded"
              disabled
            >
              <Ear className="mr-2 h-4 w-4" />
              Environment
            </TabsTrigger>
            <TabsTrigger 
              value="processing" 
              className="inline-flex items-center px-3 py-2 rounded"
              disabled
            >
              <Brain className="mr-2 h-4 w-4" />
              Processing
            </TabsTrigger>
          </TabsList>

          {/* Microphone Tab */}
          <TabsContent value="microphone">
            <div className="grid gap-6">
              {/* Status Overview */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <div className="text-2xl font-bold">Active</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">System ready for audio input</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Audio Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="text-2xl font-bold">48kHz</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">High-fidelity audio enabled</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="text-2xl font-bold">Real-time</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Low-latency streaming active</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Audio Interface */}
              <Card>
                <CardHeader>
                  <CardTitle>Audio Interface</CardTitle>
                  <CardDescription>
                    Stream and process audio from Meera's microphone system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MicStreaming />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vision Tab */}
          <TabsContent value="vision">
            <Card>
              <CardHeader>
                <CardTitle>Vision Processing</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Vision Module Under Development
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Visual perception capabilities are currently in development. 
                    Check back soon for updates on room awareness and object detection.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Environment Tab */}
          <TabsContent value="environment">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Sensing</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Environmental Sensors Coming Soon
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Temperature, humidity, and air quality monitoring capabilities 
                    are being integrated into the Meera system.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing">
            <Card>
              <CardHeader>
                <CardTitle>Neural Processing</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Advanced Processing Module
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Neural processing capabilities for enhanced decision making 
                    and context awareness are in development.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}