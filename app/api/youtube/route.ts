'use server'
// app/api/youtube/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  createYoutubeEntry,
  getYoutubeEntryById,
  getUserYoutubeEntries,
  updateYoutubeEntry,
  deleteYoutubeEntry
} from '@/app/service/youtubeDB.service'

// GET: Fetch YouTube entries
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const youtubeId = searchParams.get('id')
    const userId = searchParams.get('userId')

    // If youtubeId is provided, fetch a specific YouTube entry
    if (youtubeId) {
      const youtubeEntry = await getYoutubeEntryById(youtubeId)
      return NextResponse.json(youtubeEntry, { status: 200 })
    }

    // If userId is provided, fetch all YouTube entries for that user
    if (userId) {
      // Check if the requesting user is accessing their own data
      if (userId !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only access your own YouTube entries' },
          { status: 403 }
        )
      }

      const userYoutubeEntries = await getUserYoutubeEntries(userId)
      return NextResponse.json(userYoutubeEntries, { status: 200 })
    }

    return NextResponse.json(
      { error: 'Either YouTube ID or User ID is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching YouTube entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new YouTube entry
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { genHistoryId, description, youtubeUrl, tags } = body

    if (!genHistoryId || !youtubeUrl) {
      return NextResponse.json(
        { error: 'Generation History ID and YouTube URL are required' },
        { status: 400 }
      )
    }

    const newYoutubeEntry = await createYoutubeEntry(
      genHistoryId,
      description || '',
      youtubeUrl,
      tags || []
    )

    return NextResponse.json(newYoutubeEntry, { status: 201 })
  } catch (error) {
    console.error('Error creating YouTube entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH: Update an existing YouTube entry
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, description, youtubeUrl, tags } = body

    if (!id) {
      return NextResponse.json(
        { error: 'YouTube ID is required' },
        { status: 400 }
      )
    }

    const updatedEntry = await updateYoutubeEntry(
      id,
      description,
      youtubeUrl,
      tags
    )

    return NextResponse.json(updatedEntry, { status: 200 })
  } catch (error) {
    console.error('Error updating YouTube entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a YouTube entry
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const youtubeId = searchParams.get('id')

    if (!youtubeId) {
      return NextResponse.json(
        { error: 'YouTube ID is required' },
        { status: 400 }
      )
    }

    const result = await deleteYoutubeEntry(youtubeId)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error deleting YouTube entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
