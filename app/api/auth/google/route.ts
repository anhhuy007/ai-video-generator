// pages/api/auth/google.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuthUrl } from '@/app/service/youtube.service'

/**
 * API endpoint để bắt đầu quá trình xác thực OAuth với Google
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Tạo URL xác thực và chuyển hướng người dùng đến trang đăng nhập Google
    const authUrl = getAuthUrl()
    res.redirect(authUrl)
  } catch (error) {
    console.error('Lỗi khi tạo URL xác thực:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
