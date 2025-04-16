import { NextResponse } from 'next/server'
import { elevenlabs } from '@/lib/elevenlabs'
import { streamToBuffer } from '@/lib/utils'

export async function POST(req: Request) {
  const { text, voice, speed, stability, style } = await req.json()

  const audio = await elevenlabs.generate({
    voice,
    text,
    model_id: 'eleven_flash_v2_5',
    voice_settings: {
      speed: speed,
      stability: stability,
      style: style
    }
  })

  const audioBuffer = await streamToBuffer(audio)

  return new NextResponse(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg'
    }
  })
}
