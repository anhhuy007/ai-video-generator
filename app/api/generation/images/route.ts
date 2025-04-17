// app/api/generation/images/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { scenes, characters, imageType } = await req.json()

  if (!scenes || scenes.length === 0) {
    return NextResponse.json({ error: 'Scenes are required' }, { status: 400 })
  }

  try {
    const response = await fetch('http://127.0.0.1:8787/api/generate/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scenes,
        characters,
        imageType
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate images')
    }

    const data = await response.json()
    const images = data.images || []

    // const base64Images = images.map(
    //   (image: string) => `data:image/png;base64,${image}`
    // )

    const scenesWithImages = scenes.map((scene: any, index: number) => ({
      ...scene,
      image: images[index] || null
    }))

    return NextResponse.json({ scenes: scenesWithImages })
  } catch (error) {
    console.error('Error generating images:', error)
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    )
  }
}
