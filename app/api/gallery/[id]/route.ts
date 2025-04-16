'use server'
// app/api/gallery/[id]/route.ts
import { NextResponse } from 'next/server'
import {
  getGalleryEntryById
} from '@/app/service/galery.service'
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const genHistory = await getGalleryEntryById(id)
    return NextResponse.json({ genHistory }, { status: 200 })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
