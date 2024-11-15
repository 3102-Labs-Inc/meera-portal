// app/page.tsx
'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    router.push('/login')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Meera
          <span className="block text-xl font-normal text-gray-500 mt-2 tracking-widest">
            by 3102 LABS
          </span>
        </h1>
        
        <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Computing Interface for Meeting Rooms
        </p>

        <div className="space-x-4">
          <Button 
            onClick={handleClick}
            disabled={isLoading}
            className="bg-black text-white hover:bg-black/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              'Login to Portal'
            )}
          </Button>
        </div>
      </div>
    </main>
  )
}