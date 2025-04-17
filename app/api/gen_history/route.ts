'use server'
// app/api/gen_history/route.ts
import { NextResponse } from 'next/server'
import {
  createGenHistory,
  getGenHistoryForUser
} from '@/app/service/genHistory.service'

export async function POST(req: Request) {
  try {
    const { userId, prompt, galleryId } = await req.json()
    if (!userId || !prompt) {
      return NextResponse.json(
        { error: 'userId and prompt are required' },
        { status: 400 }
      )
    }
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

export async function GET(req: Request) {
  try {
    // Get userId from URL query parameter instead of body
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

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
