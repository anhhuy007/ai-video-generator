'use server'
// app/api/video/[id]/route.ts
import { NextResponse } from 'next/server'
import { getGalleryEntryById } from '@/app/service/galery.service'
import { getGenHistoryForGallery } from '@/app/service/genHistory.service'
import { getUserById } from '@/app/service/user.service'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Get gallery entry
    const galleryEntry = await getGalleryEntryById(id)

    if (!galleryEntry) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Get gen history for this gallery entry
    const genHistoryEntries = await getGenHistoryForGallery(id)
    const genHistory =
      genHistoryEntries.length > 0 ? genHistoryEntries[0] : null

    // Get creator information if available
    let creator = null
    if (galleryEntry.added_by) {
      creator = await getUserById(galleryEntry.added_by)
    }

    // Return comprehensive video information
    return NextResponse.json(
      {
        galleryEntry,
        genHistory,
        creator
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching video details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
