// app/history/page.tsx
'use client'

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/app/history/components/sidebar'
import { DashboardHeader } from '@/app/history/components/header'
import VideoList from './components/VideoList'
import { signOut, useSession } from 'next-auth/react'

export default function HistoryPage() {
  const session = useSession()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className='flex h-screen w-full overflow-hidden bg-background'>
        <DashboardSidebar />
        <div className='flex flex-1 flex-col overflow-hidden'>
          <DashboardHeader
            session={session.data}
            onSignOut={() => {
              console.log('Sign out clicked')
              signOut()
            }}
          />

          <div className='flex flex-1 flex-col overflow-hidden'>
            <div className='px-4 py-4'>
              <h1 className='text-3xl font-bold'>Lịch Sử Video</h1>
            </div>

            <div className='flex-1 overflow-hidden px-4'>
              <VideoList />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

// export default function HistoryPage() {
//   return (
//     <div className='container mx-auto px-4 py-8'>
//       <h1 className='mb-6 text-3xl font-bold'>Lịch Sử Video</h1>
//       <VideoList />
//     </div>
//   )
// }