import { NextResponse } from 'next/server'
import {
  createUserRequest,
  getUserRequestsForConversation
} from '@/app/service/service'

export async function POST(req: Request) {
  try {
    const { conversationId, requestText } = await req.json()
    if (!conversationId || !requestText) {
      return NextResponse.json(
        { error: 'conversationId and requestText are required' },
        { status: 400 }
      )
    }
    const userRequest = await createUserRequest(conversationId, requestText)
    return NextResponse.json({ userRequest }, { status: 201 })
  } catch (error) {
    console.error('Error creating user request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { conversationId } = await req.json()
    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }
    const userRequests = await getUserRequestsForConversation(conversationId)
    return NextResponse.json({ userRequests }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
