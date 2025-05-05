import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { writeFile } from 'fs/promises'
import path from 'path'
import os from 'os'
import fs from 'fs/promises'

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
    console.log('file', file)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const tempDir = os.tmpdir()
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    tempFilePath = path.join(tempDir, uniqueFilename)

    await writeFile(tempFilePath, buffer)

    const uploadResponse = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: 'raw',
      folder: 'srt_files'
    })

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
        // Check if file exists before attempting to delete it
        const fileExists = await fs
          .stat(tempFilePath)
          .then(() => true)
          .catch(() => false)
        if (fileExists) {
          await fs.unlink(tempFilePath)
        }
      } catch (e) {
        console.error('Error removing temporary file:', e)
      }
    }
  }
}
