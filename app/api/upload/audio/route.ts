import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { writeFile } from 'fs/promises'
import path from 'path'
import os from 'os'
import fs from 'fs/promises'

// app/api/upload/audio/route.ts
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(req: Request) {
  let tempFilePath = ''

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const audioUrl = formData.get('audioUrl') as string | null

    let uploadResponse

    if (audioUrl) {
      uploadResponse = await cloudinary.uploader.upload(audioUrl, {
        resource_type: 'auto',
        folder: 'audio_files'
      })
    } else if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const tempDir = os.tmpdir()
      const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      tempFilePath = path.join(tempDir, uniqueFilename)

      await writeFile(tempFilePath, buffer)

      uploadResponse = await cloudinary.uploader.upload(tempFilePath, {
        resource_type: 'auto',
        folder: 'audio_files'
      })
    } else {
      return NextResponse.json(
        { error: 'No file or audioUrl provided' },
        { status: 400 }
      )
    }

    return NextResponse.json({ url: uploadResponse.secure_url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath)
      } catch (e) {
        console.error('Error removing temporary file:', e)
      }
    }
  }
}
