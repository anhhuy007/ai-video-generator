import { google } from 'googleapis'

// Cấu hình thông tin OAuth 2.0
const OAuth2 = google.auth.OAuth2
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

// Sử dụng client ID và secret đã cung cấp
const CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '558968134768-j6tjr213udqfrfl5rpef1s472rjmfon6.apps.googleusercontent.com'
const CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || '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'
const REDIRECT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
  'http://localhost:3000/api/auth/callback/google'

// Interface cho thông tin video
export interface VideoMetadata {
  title: string
  description: string
  tags: string[]
  privacyStatus: 'public' | 'unlisted' | 'private'
}

export class YouTubeService {
  private oauth2Client: any

  constructor() {
    this.oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
  }

  // Tạo URL xác thực
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      include_granted_scopes: true
    })
  }

  // Lấy token truy cập từ mã xác thực
  async getToken(code: string): Promise<any> {
    const { tokens } = await this.oauth2Client.getToken(code)
    this.oauth2Client.setCredentials(tokens)
    return tokens
  }

  // Set token truy cập
  setToken(tokens: any): void {
    this.oauth2Client.setCredentials(tokens)
  }

  // Tải video lên YouTube
  async uploadVideo(videoFile: File, metadata: VideoMetadata): Promise<string> {
    try {
      const youtube = google.youtube({
        version: 'v3',
        auth: this.oauth2Client
      })

      // Chuyển đổi file thành buffer
      const arrayBuffer = await videoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Tạo request để tải lên video
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags
          },
          status: {
            privacyStatus: metadata.privacyStatus
          }
        },
        media: {
          body: buffer
        }
      })

      // Trả về ID của video đã tải lên
      return response.data.id || ''
    } catch (error) {
      console.error('Lỗi khi tải video lên YouTube:', error)
      throw error
    }
  }
}

// Tạo và xuất một instance của service
export const youtubeService = new YouTubeService()
