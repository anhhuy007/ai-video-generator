'use server'
// app/api/gallery/route.ts
import { NextResponse } from 'next/server'
import {
  createGalleryEntry,
  getGalleryEntries
} from '@/app/service/gallery.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByGoogleId } from '@/app/service/user.service'

export async function POST(req: Request) {

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoUrl, title, category, duration } = await req.json()
    if (!videoUrl || !title || typeof duration !== 'number') {
      return NextResponse.json(
        { error: 'videoUrl, title, and duration are required' },
        { status: 400 }
      )
    }

    // Get the actual user ID from the database using the Google ID from session
    const user = await getUserByGoogleId(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const galleryEntry = await createGalleryEntry(
      videoUrl,
      title,
      user.id,
      category || null,
      duration
    )
    return NextResponse.json({ galleryEntry }, { status: 201 })
 
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
