// pages/api/auth/status.ts
import { NextApiRequest, NextApiResponse } from 'next'
import {
  setAuthCredentials,
  isAuthenticated
} from '@/app/service/youtube.service'

/**
 * API endpoint để kiểm tra trạng thái xác thực
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Lấy access token từ cookie
    const accessToken = req.cookies.youtube_access_token
    const refreshToken = req.cookies.youtube_refresh_token

    if (!accessToken) {
      return res.status(200).json({ authenticated: false })
    }

    // Set credentials cho OAuth client
    setAuthCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    // Kiểm tra xác thực
    const authenticated = isAuthenticated()

    res.status(200).json({ authenticated })
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái xác thực:', error)
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Lỗi server khi kiểm tra xác thực'
    })
  }
}
