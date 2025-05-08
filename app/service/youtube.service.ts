// services/youtubeService.ts
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'

export interface YouTubeTokens {
  access_token: string
  refresh_token?: string
  scope: string
  token_type: string
  expiry_date: number
}

class YouTubeService {
  private youtube: any = null
  public oAuth2Client: any = null

  /**
   * Initialize the YouTube API client with OAuth credentials
   */
  initialize(
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): void {
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing required OAuth credentials')
    }

    this.oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    )

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oAuth2Client
    })
  }

  /**
   * Get the authorization URL for YouTube
   */
  getAuthUrl(): string {
    if (!this.oAuth2Client) {
      throw new Error('YouTube service not initialized')
    }

    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload']
    })
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokenFromCode(code: string): Promise<YouTubeTokens> {
    if (!this.oAuth2Client) {
      throw new Error('YouTube service not initialized')
    }

    try {
      const { tokens } = await this.oAuth2Client.getToken(code)
      this.oAuth2Client.setCredentials(tokens)
      return tokens
    } catch (error: any) {
      throw new Error(`Failed to get tokens from code: ${error.message}`)
    }
  }

  /**
   * Set credentials from existing tokens
   */
  setCredentials(tokens: YouTubeTokens): void {
    if (!this.oAuth2Client) {
      throw new Error('YouTube service not initialized')
    }
    this.oAuth2Client.setCredentials(tokens)
  }

  /**
   * Upload video to YouTube
   */
  async uploadVideo(
    filePath: string,
    title: string,
    description: string,
    tags: string[] = [],
    privacyStatus: string = 'unlisted'
  ): Promise<{ id: string; url: string }> {
    if (!this.youtube) {
      throw new Error('YouTube service not initialized')
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Video file not found at: ${filePath}`)
    }

    try {
      // Upload video to YouTube
      const res = await this.youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: '22' // People & Blogs category
          },
          status: {
            privacyStatus
          }
        },
        media: {
          body: fs.createReadStream(filePath)
        }
      })

      // Return video ID and URL
      return {
        id: res.data.id,
        url: `https://www.youtube.com/watch?v=${res.data.id}`
      }
    } catch (error: any) {
      throw new Error(`Failed to upload video: ${error.message}`)
    }
  }
}

// Export singleton instance
const youtubeService = new YouTubeService()
export default youtubeService
