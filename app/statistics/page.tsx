'use client'
// app/statistics/page.tsx
import { useState, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/app/history/components/sidebar'
import { DashboardHeader } from '@/app/history/components/header'
import { signOut, useSession } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GenerationStats } from './components/GenerationStats'
import { UsageMetrics } from './components/UsageMetrics'
import { PopularPrompts } from './components/PopularPrompts'

export default function StatisticsPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [status])

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='rounded-lg border bg-white p-6 shadow-md'>
          <h1 className='mb-4 text-2xl font-bold'>Access Denied</h1>
          <p className='mb-4'>Please log in to view your statistics.</p>
          <button
            onClick={() => (window.location.href = '/api/auth/google')}
            className='rounded bg-primary px-4 py-2 text-white hover:bg-primary/90'
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className='flex h-screen w-full overflow-hidden bg-background'>
        <DashboardSidebar />
        <div className='flex flex-1 flex-col overflow-hidden'>
          <DashboardHeader session={session} onSignOut={() => signOut()} />
          <div className='flex flex-1 flex-col overflow-auto'>
            <div className='px-6 py-6'>
              <h1 className='text-3xl font-bold'>Statistics & Analytics</h1>
              <p className='mt-2 text-muted-foreground'>
                Track your video generation activity and performance
              </p>
            </div>
            <div className='flex-1 px-6 pb-6'>
              <Tabs defaultValue='generation' className='w-full'>
                <TabsList className='mb-6 grid w-full max-w-md grid-cols-3'>
                  <TabsTrigger value='generation'>Video Generation</TabsTrigger>
                  <TabsTrigger value='usage'>Usage</TabsTrigger>
                  <TabsTrigger value='prompts'>Keywords</TabsTrigger>
                </TabsList>
                <TabsContent value='generation' className='space-y-6'>
                  <GenerationStats userId={session?.user?.id} />
                </TabsContent>
                <TabsContent value='usage' className='space-y-6'>
                  <UsageMetrics />
                </TabsContent>
                <TabsContent value='prompts' className='space-y-6'>
                  <PopularPrompts userId={session?.user?.id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
