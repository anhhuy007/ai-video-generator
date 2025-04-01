import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/app/service/service'

export async function POST(req: NextRequest) {
  try {
    const { googleId, email, name, avatarUrl } = await req.json()

    if (!googleId || !email) {
      return NextResponse.json(
        { error: 'googleId and email are required' },
        { status: 400 }
      )
    }

    const user = await createUser(googleId, email, name, avatarUrl)
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
