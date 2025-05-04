import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { videoUrl, title, description, tags, platforms } = req.body

    if (!videoUrl || !title || !platforms || !platforms.length) {
      return res.status(400).json({
        message: 'Video URL, title, and at least one platform are required'
      })
    }

    const results: {
      overall: boolean
      platforms: {
        [key: string]: { success: boolean; data?: any; error?: string }
      }
    } = {
      overall: false,
      platforms: {}
    }

    // Process each selected platform
    for (const platform of platforms) {
      try {
        // Call the appropriate API endpoint for each platform
        const response = await axios.post(
          `/api/publish/${platform.toLowerCase()}`,
          { videoUrl, title, description, tags },
          { baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '' }
        )

        results.platforms[platform] = {
          success: true,
          data: response.data
        }
      } catch (error) {
        console.error(`Error publishing to ${platform}:`, error)
        results.platforms[platform] = {
          success: false,
          error:
            (error as any).response?.data?.message || (error as any).message
        }
      }
    }

    // Check if at least one platform succeeded
    const anySuccess = Object.values(results.platforms).some(
      (platform: any) => platform.success
    )

    if (anySuccess) {
      results.overall = true

      // Save the publication to the database
      await savePublicationToDatabase({
        videoUrl,
        title,
        description,
        tags,
        platforms: results.platforms,
        publishedAt: new Date()
      })

      return res.status(200).json({
        success: true,
        message: 'Video published successfully to one or more platforms',
        results
      })
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to publish video to any platform',
        results
      })
    }
  } catch (error) {
    console.error('Publication error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to process publication request',
      error: (error as Error).message
    })
  }
}

// Helper function to save publication record to database
async function savePublicationToDatabase(publicationData: {
  videoUrl: any
  title: any
  description: any
  tags: any
  platforms: { [key: string]: { success: boolean; data?: any; error?: string } }
  publishedAt: Date
}) {
  // This function would integrate with your database
  // Using MongoDB, Prisma, etc. depending on your setup

  // Example implementation with a hypothetical database client
  try {
    // const db = getDbClient();
    // await db.collection('publications').insertOne(publicationData);

    // For now, just log that we would save the data
    console.log('Would save publication to database:', publicationData)
    return true
  } catch (error) {
    console.error('Error saving publication to database:', error)
    throw error
  }
}
