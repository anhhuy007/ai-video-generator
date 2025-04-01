import { NextResponse } from 'next/server'
import {
  createAIResponse,
  getAIResponseForUserRequest
} from '@/app/service/service'

export async function POST(req: Request) {
  try {
    const { userRequestId, videoUrl } = await req.json()
    if (!userRequestId || !videoUrl) {
      return NextResponse.json(
        { error: 'userRequestId and videoUrl are required' },
        { status: 400 }
      )
    }
    const aiResponse = await createAIResponse(userRequestId, videoUrl)
    return NextResponse.json({ aiResponse }, { status: 201 })
  } catch (error) {
    console.error('Error creating AI response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { userRequestId } = await req.json()
    if (!userRequestId) {
      return NextResponse.json(
        { error: 'userRequestId is required' },
        { status: 400 }
      )
    }
    const aiResponse = await getAIResponseForUserRequest(userRequestId)
    return NextResponse.json({ aiResponse }, { status: 200 })
  } catch (error) {
    console.error('Error fetching AI response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
