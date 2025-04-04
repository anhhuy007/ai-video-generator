import { NextResponse } from 'next/server'
import {
  createUser,
  updateUser,
  deleteUser,
  getUserByGoogleId
} from '@/app/service/user.service'

export async function POST(req: Request) {
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

// Cập nhật thông tin người dùng
export async function PATCH(req: Request) {
  try {
    const { userId, email, name, avatarUrl } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    const user = await updateUser(userId, email, name, avatarUrl)
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Xóa người dùng
export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    const user = await deleteUser(userId)
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Lấy thông tin người dùng qua googleId
export async function GET(req: Request) {
  try {
    const { googleId } = await req.json()
    if (!googleId) {
      return NextResponse.json(
        { error: 'googleId is required' },
        { status: 400 }
      )
    }
    const user = await getUserByGoogleId(googleId)
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
