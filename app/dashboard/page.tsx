'use client'

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/app/dashboard/components/sidebar'
import { DashboardHeader } from '@/app/dashboard/components/header'
import { VideoGenerator } from '@/app/dashboard/tabs/generate/generator'
import { VideoGallery } from '@/app/dashboard/tabs/gallery/gallery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsageTabs } from '@/app/dashboard/tabs/usage/usage'
import { signOut, useSession } from 'next-auth/react'

export function DashboardPage() {
  const session = useSession()
  const [activeTab, setActiveTab] = useState('generate')

  return (
    <SidebarProvider defaultOpen={true}>
      <div className='flex h-screen w-full overflow-hidden bg-background'>
        <DashboardSidebar />
        <div className='flex flex-1 flex-col overflow-hidden'>
          {/* <DashboardHeader
            session={session.data}
            onSignOut={() => {
              console.log('Sign out clicked')
              signOut()
            }}
          /> */}
          <main className='flex-1 overflow-auto p-4 md:p-6'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='mb-6 grid w-full max-w-md grid-cols-3'>
                <TabsTrigger value='generate'>Generate</TabsTrigger>
                <TabsTrigger value='gallery'>Gallery</TabsTrigger>
                <TabsTrigger value='usage'>Usage</TabsTrigger>
              </TabsList>
              <TabsContent value='generate' className='space-y-6'>
                <VideoGenerator />
              </TabsContent>
              <TabsContent value='gallery' className='space-y-6'>
                <VideoGallery />
              </TabsContent>
              <TabsContent value='usage' className='space-y-6'>
                <UsageTabs />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
