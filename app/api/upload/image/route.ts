import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(req: Request) {
  let tempFilePath = ''

  try {
    const { base64Image } = await req.json()

    if (!base64Image) {
      return NextResponse.json(
        { error: 'No base64Image provided' },
        { status: 400 }
      )
    }

    // Tách dữ liệu base64 và định dạng ảnh
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid base64 image format' },
        { status: 400 }
      )
    }

    const imageType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')

    // Ghi ra file tạm dưới dạng PNG
    const tempDir = os.tmpdir()
    const uniqueFilename = `${Date.now()}.png`
    tempFilePath = path.join(tempDir, uniqueFilename)

    await writeFile(tempFilePath, buffer)

    // Upload lên Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: 'image',
      folder: 'story_images',
      format: 'png'
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
        await unlink(tempFilePath)
      } catch (e) {
        console.error('Error removing temporary file:', e)
      }
    }
  }
}
