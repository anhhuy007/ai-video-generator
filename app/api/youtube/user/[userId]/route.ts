'use server'
// app/api/youtube/user/[userId]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getUserYoutubeEntries } from '@/app/service/youtubeDB.service'

interface Params {
  params: {
    userId: string
  }
}

// GET: Fetch all YouTube entries for a specific user
export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = params
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if the requesting user is accessing their own data
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only access your own YouTube entries' },
        { status: 403 }
      )
    }

    const userYoutubeEntries = await getUserYoutubeEntries(userId)
    return NextResponse.json(userYoutubeEntries, { status: 200 })
  } catch (error) {
    console.error('Error fetching user YouTube entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
