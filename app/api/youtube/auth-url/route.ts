import youtubeService from '@/app/service/youtube.service'
import { NextResponse } from 'next/server'

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI

if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REDIRECT_URI) {
  throw new Error(
    'YouTube OAuth credentials are not set in environment variables'
  )
} else {
  youtubeService.initialize(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET,
    YOUTUBE_REDIRECT_URI
  )
}

export async function GET() {
  try {
    const authUrl = youtubeService.getAuthUrl()
    return NextResponse.json({
      success: true,
      authUrl
    })
  } catch (error: any) {
    console.error('Error getting auth URL:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get YouTube authorization URL',
        error: error.message
      },
      { status: 500 }
    )
  }
}
