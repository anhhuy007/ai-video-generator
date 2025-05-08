// pages/api/auth/callback/google.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { handleOAuthCallback } from '@/app/service/youtube.service'
/**
 * API endpoint để xử lý callback từ Google OAuth
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code, error } = req.query

  // Nếu có lỗi từ Google
  if (error) {
    console.error('Lỗi từ Google OAuth:', error)
    return res.redirect(`/?error=${encodeURIComponent(error as string)}`)
  }

  // Nếu không có code
  if (!code || Array.isArray(code)) {
    return res.redirect('/?error=invalid_code')
  }

  try {
    // Xử lý authorization code từ Google
    const authResult = await handleOAuthCallback(code)

    if (authResult.success) {
      // Lưu tokens vào session hoặc cookies
      // Lưu ý: Trong môi trường thực tế, bạn nên sử dụng một phương pháp lưu trữ an toàn
      // và mã hóa tokens, như ironSession hoặc JWT được mã hóa

      // Tạo cookie với token (đây chỉ là ví dụ, không nên sử dụng trong production)
      if (authResult.tokens) {
        res.setHeader(
          'Set-Cookie',
          [
            `youtube_access_token=${authResult.tokens.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict`,
            authResult.tokens.refresh_token
              ? `youtube_refresh_token=${authResult.tokens.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`
              : ''
          ].filter(Boolean)
        )
      } else {
        console.error('Tokens are undefined')
        return res.redirect('/?error=invalid_tokens')
      }

      // Chuyển hướng về trang chính với trạng thái đã xác thực
      return res.redirect('/?authenticated=true')
    } else {
      // Xử lý lỗi xác thực
      return res.redirect(`/?error=${encodeURIComponent('auth_failed')}`)
    }
  } catch (error) {
    console.error('Lỗi khi xử lý callback:', error)
    return res.redirect(`/?error=${encodeURIComponent('server_error')}`)
  }
}
