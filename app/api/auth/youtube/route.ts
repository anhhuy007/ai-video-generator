import { NextApiRequest, NextApiResponse } from 'next'
import { youtubeService } from '@/app/service/youtube.service'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const authUrl = youtubeService.getAuthUrl()
    res.redirect(authUrl)
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
