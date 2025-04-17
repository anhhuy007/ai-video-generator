import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { prompt, sceneCount } = await req.json()

  if (!prompt || prompt.length === 0) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  if (!sceneCount || sceneCount <= 0) {
    return NextResponse.json(
      { error: 'Scene count must be greater than 0' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch('http://127.0.0.1:8787/api/generate/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: prompt,
        sceneCount: sceneCount
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate content')
    }

    const data = await response.json()
    const story = data.story

    return NextResponse.json({ story })
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
