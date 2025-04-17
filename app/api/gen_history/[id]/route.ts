'use server'
// app/api/gen_history/[id]/route.ts
import { NextResponse } from 'next/server'
import { getGenHistoryById } from '@/app/service/genHistory.service'
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const genHistory = await getGenHistoryById(id)
    return NextResponse.json({ genHistory }, { status: 200 })
  } catch (error) {
    console.error('Error fetching gen history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
