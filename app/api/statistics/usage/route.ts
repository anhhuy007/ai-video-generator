'use server'
// app/api/statistics/usage/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserUsageStatistics } from '@/app/service/usage.service'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if the requesting user is accessing their own data
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only access your own statistics' },
        { status: 403 }
      )
    }

    const stats = await getUserUsageStatistics(userId)
    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Error fetching usage statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
