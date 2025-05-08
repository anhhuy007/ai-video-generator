// pages/api/youtube/upload.ts
import { NextApiRequest, NextApiResponse } from 'next'
import {
  uploadVideoFromUrl,
  isAdminAuthenticated
} from '@/app/service/youtube.service'

/**
 * API endpoint để upload video lên YouTube thông qua tài khoản admin
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Kiểm tra xem admin đã xác thực chưa
    if (!isAdminAuthenticated()) {
      return res.status(401).json({
        error:
          'Admin chưa xác thực với YouTube API. Vui lòng xác thực trước khi upload video.'
      })
    }

    // Lấy thông tin video từ request body
    const { videoUrl, title, description, tags } = req.body

    if (!videoUrl) {
      return res.status(400).json({ error: 'Thiếu URL video' })
    }

    // Chuẩn bị tags dưới dạng array
    const tagArray = tags
      ? tags.split(',').map((tag: string) => tag.trim())
      : []

    // Upload video lên YouTube
    const result = await uploadVideoFromUrl(videoUrl, {
      title: title || 'Video không có tiêu đề',
      description: description || '',
      tags: tagArray
    })

    if (result.success) {
      res.status(200).json(result)
    } else {
      res.status(500).json({ error: result.error })
    }
  } catch (error) {
    console.error('Lỗi khi upload video:', error)
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Lỗi server khi upload video'
    })
  }
}
