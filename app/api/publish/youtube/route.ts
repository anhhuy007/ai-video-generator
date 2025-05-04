import { NextApiRequest, NextApiResponse } from 'next'
import { youtubeService } from '@/app/service/youtube.service'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const accessToken = req.cookies.youtube_access_token
    const refreshToken = req.cookies.youtube_refresh_token

    if (!accessToken) {
      return res.status(401).json({ message: 'Not authenticated with YouTube' })
    }

    youtubeService.setToken({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024 // 500MB
    })

    const result: any = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve({ fields, files })
      })
    })

    const { fields, files } = result

    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title
    const description = Array.isArray(fields.description)
      ? fields.description[0]
      : fields.description
    const tagsString = Array.isArray(fields.tags) ? fields.tags[0] : fields.tags
    const tags = tagsString.split(',').map((tag: string) => tag.trim())
    const privacyStatus = Array.isArray(fields.privacyStatus)
      ? fields.privacyStatus[0]
      : fields.privacyStatus || 'private'

    const videoFile = Array.isArray(files.video) ? files.video[0] : files.video

    if (!videoFile) {
      return res.status(400).json({ message: 'No video file uploaded' })
    }

    const filePath = videoFile.filepath
    const fileBuffer = fs.readFileSync(filePath)
    const fileBlob = new Blob([fileBuffer])
    const file = new File(
      [fileBlob],
      videoFile.originalFilename || 'video.mp4',
      {
        type: videoFile.mimetype || 'video/mp4'
      }
    )

    const videoId = await youtubeService.uploadVideo(file, {
      title,
      description,
      tags,
      privacyStatus: privacyStatus as 'public' | 'unlisted' | 'private'
    })

    fs.unlinkSync(filePath)

    res.status(200).json({
      success: true,
      videoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    res
      .status(500)
      .json({ message: 'Error uploading video', error: errorMessage })
  }
}
