import { google } from 'googleapis'

// Cấu hình thông tin OAuth 2.0
const OAuth2 = google.auth.OAuth2
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
  'http://localhost:3000/api/auth/callback/google'

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

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      include_granted_scopes: true
    })
  }

  async getToken(code: string): Promise<any> {
    const { tokens } = await this.oauth2Client.getToken(code)
    this.oauth2Client.setCredentials(tokens)
    return tokens
  }

  setToken(tokens: any): void {
    this.oauth2Client.setCredentials(tokens)
  }

  async uploadVideo(videoFile: File, metadata: VideoMetadata): Promise<string> {
    try {
      const youtube = google.youtube({
        version: 'v3',
        auth: this.oauth2Client
      })

      const arrayBuffer = await videoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

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

      return response.data.id || ''
    } catch (error) {
      console.error('Lỗi khi tải video lên YouTube:', error)
      throw error
    }
  }
}

export const youtubeService = new YouTubeService()
