'use server'
//app/api/gen_history/route.ts

import { NextResponse } from 'next/server'
import {
  createGenHistory,
  getGenHistoryForUser
} from '@/app/service/genHistory.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, galleryId } = await req.json()
    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const userId = session.user.id
    const historyEntry = await createGenHistory(userId, prompt, galleryId)
    return NextResponse.json({ historyEntry }, { status: 201 })
  } catch (error) {
    console.error('Error creating gen history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('--------------session', session.user.id)

    const userId = session.user.id
    const historyEntries = await getGenHistoryForUser(userId)
    return NextResponse.json({ historyEntries }, { status: 200 })
  } catch (error) {
    console.error('Error fetching gen history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
