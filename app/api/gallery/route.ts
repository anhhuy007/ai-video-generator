'use server'
// app/api/gallery/route.ts
import { NextResponse } from 'next/server'
import {
  createGalleryEntry,
  getGalleryEntries
} from '@/app/service/galery.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserByGoogleId } from '@/app/service/user.service'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoUrl, title } = await req.json()
    if (!videoUrl || !title) {
      return NextResponse.json(
        { error: 'videoUrl and title are required' },
        { status: 400 }
      )
    }

    // Get the actual user ID from the database using the Google ID from session
    const user = await getUserByGoogleId(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const galleryEntry = await createGalleryEntry(videoUrl, title, user.id)
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
