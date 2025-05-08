'use server'
// app/api/youtube/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  getYoutubeEntryById,
  updateYoutubeEntry,
  deleteYoutubeEntry
} from '@/app/service/youtubeDB.service'

interface Params {
  params: {
    id: string
  }
}

// GET: Fetch a specific YouTube entry by ID
export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: 'YouTube ID is required' },
        { status: 400 }
      )
    }

    const youtubeEntry = await getYoutubeEntryById(id)
    return NextResponse.json(youtubeEntry, { status: 200 })
  } catch (error) {
    console.error('Error fetching YouTube entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH: Update a specific YouTube entry by ID
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: 'YouTube ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { description, youtubeUrl, tags } = body

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

// DELETE: Remove a specific YouTube entry by ID
export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json(
        { error: 'YouTube ID is required' },
        { status: 400 }
      )
    }

    const result = await deleteYoutubeEntry(id)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error deleting YouTube entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
