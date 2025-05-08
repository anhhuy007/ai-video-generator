// app/api/youtube/auth-code/route.ts
import { NextRequest, NextResponse } from 'next/server'
import youtubeService from '@/app/service/youtube.service'

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization code is required'
        },
        { status: 400 }
      )
    }

    const tokens = await youtubeService.getTokenFromCode(code)

    return NextResponse.json({
      success: true,
      tokens
    })
  } catch (error: any) {
    console.error('Error handling auth code:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process authorization code',
        error: error.message
      },
      { status: 500 }
    )
  }
}
