'use client'

import { DashboardPage } from '@/app/dashboard/page'
import { useSession } from 'next-auth/react'
import AuthenticationPage from './auth/page'

export default function Home() {
  const { status } = useSession()

  if (status === 'authenticated') {
    return <DashboardPage />
  }
  else {
    return <AuthenticationPage />
  }
}
