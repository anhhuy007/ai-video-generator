import { NextApiRequest, NextApiResponse } from 'next'
import { youtubeService } from '@/app/service/youtube.service'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { code } = req.query

      if (!code || Array.isArray(code)) {
        return res.status(400).json({ message: 'Invalid authorization code' })
      }

      const tokens = await youtubeService.getToken(code)

      res.setHeader('Set-Cookie', [
        `youtube_access_token=${tokens.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${tokens.expires_in}`,
        `youtube_refresh_token=${tokens.refresh_token || ''}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
      ])

      res.redirect('/')
    } catch (error) {
      console.error('Error during callback handling:', error)
      res.status(500).json({ message: 'Authentication failed' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
