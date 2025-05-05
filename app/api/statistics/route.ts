'use server'
// app/api/statistics/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getStatistics } from '@/app/service/statistics.service'

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

    const stats = await getStatistics(userId)
    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
