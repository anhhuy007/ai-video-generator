'use server'
// app/api/statistics/usage/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  getUserUsageStatistics,
  getMetricComparison
} from '@/app/service/usage.service'

const validTimeframes = ['all', 'week', 'month', 'year']

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const timeframe = searchParams.get('timeframe') || 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only access your own statistics' },
        { status: 403 }
      )
    }

    if (!validTimeframes.includes(timeframe)) {
      return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 })
    }

    const stats = await getUserUsageStatistics(userId, timeframe)
    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error('Error fetching usage statistics:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { metric } = body

    if (!metric) {
      return NextResponse.json(
        { error: 'Metric parameter is required' },
        { status: 400 }
      )
    }

    if (!['totalVideos', 'totalDuration', 'avgDuration'].includes(metric)) {
      return NextResponse.json({ error: 'Invalid metric' }, { status: 400 })
    }

    const comparison = await getMetricComparison(session.user.id, metric)
    if (!comparison) {
      return NextResponse.json(
        { error: 'No data available for comparison' },
        { status: 404 }
      )
    }

    return NextResponse.json(comparison, { status: 200 })
  } catch (error) {
    console.error('Error comparing metrics:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Failed to compare metrics' },
      { status: 500 }
    )
  }
}
