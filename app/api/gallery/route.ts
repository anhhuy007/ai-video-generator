'use server'
// app/api/gallery/route.ts
import { NextResponse } from 'next/server'
import {
  createGalleryEntry,
  getGalleryEntries,
} from '@/app/service/galery.service'

export async function POST(req: Request) {
  try {
    const { videoUrl, addedBy } = await req.json()
    if (!videoUrl || !addedBy) {
      return NextResponse.json(
        { error: 'videoUrl and addedBy are required' },
        { status: 400 }
      )
    }
    const galleryEntry = await createGalleryEntry(videoUrl, addedBy)
    return NextResponse.json({ galleryEntry }, { status: 201 })
  } catch (error) {
    console.error('Error creating gallery entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const galleryEntries = await getGalleryEntries()
    return NextResponse.json({ galleryEntries }, { status: 200 })
  } catch (error) {
    console.error('Error fetching gallery entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

