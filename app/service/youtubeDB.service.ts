'use server'
// app/service/youtubeDB.service.ts
import { sql } from '@/app/utils/database'

/**
 * Create a new YouTube entry in the database
 * @param genHistoryId - ID of the generation history entry
 * @param description - YouTube video description
 * @param youtubeUrl - URL of the YouTube video
 * @param tags - Array of tags for the YouTube video
 * @returns The created YouTube entry
 */
export async function createYoutubeEntry(
  genHistoryId: string,
  description: string,
  youtubeUrl: string,
  tags: string[]
) {
  try {
    const result = await sql`
  INSERT INTO youtube (
    gen_history_id,
    description,
    youtube_url,
    tags,
    created_at,
    updated_at
  )
  VALUES (
    ${genHistoryId}::uuid,
    ${description},
    ${youtubeUrl},
    ARRAY[${tags}]::text[],
    NOW(),
    NOW()
  )
  RETURNING id, gen_history_id, description, youtube_url, tags, created_at, updated_at
`

    if (result && result.length > 0) {
      return result[0]
    }

    throw new Error('Failed to create YouTube entry')
  } catch (error) {
    console.error('Error creating YouTube entry:', error)
    throw new Error('Failed to create YouTube entry')
  }
}

/**
 * Get YouTube entry details by YouTube ID
 * @param youtubeId - ID of the YouTube entry
 * @returns Combined data from gallery, gen_history, and youtube tables
 */
export async function getYoutubeEntryById(youtubeId: string) {
  try {
    const result = await sql`
      SELECT 
        y.id as youtube_id,
        y.description as youtube_description,
        y.youtube_url,
        y.tags as youtube_tags,
        y.created_at as youtube_created_at,
        gh.id as gen_history_id,
        gh.prompt,
        g.id as gallery_id,
        g.title as gallery_title,
        g.video_url,
        g.duration,
        g.category
      FROM youtube y
      JOIN gen_history gh ON y.gen_history_id = gh.id
      JOIN gallery g ON gh.gallery_id = g.id
      WHERE y.id = ${youtubeId}::uuid
    `

    if (result && result.length > 0) {
      return {
        youtubeId: result[0].youtube_id,
        description: result[0].youtube_description,
        youtubeUrl: result[0].youtube_url,
        tags: result[0].youtube_tags,
        createdAt: result[0].youtube_created_at,
        genHistoryId: result[0].gen_history_id,
        prompt: result[0].prompt,
        galleryId: result[0].gallery_id,
        galleryTitle: result[0].gallery_title,
        videoUrl: result[0].video_url,
        duration: result[0].duration,
        category: result[0].category
      }
    }

    throw new Error('YouTube entry not found')
  } catch (error) {
    console.error('Error fetching YouTube entry:', error)
    throw new Error('Failed to fetch YouTube entry')
  }
}

/**
 * Get all YouTube entries for a user
 * @param userId - Google ID of the user
 * @returns Array of YouTube entries with related data
 */
export async function getUserYoutubeEntries(userId: string) {
  try {
    const result = await sql`
      SELECT 
        y.id as youtube_id,
        y.description as youtube_description,
        y.youtube_url,
        y.tags as youtube_tags,
        y.created_at as youtube_created_at,
        gh.id as gen_history_id,
        gh.prompt,
        g.id as gallery_id,
        g.title as gallery_title,
        g.video_url,
        g.duration,
        g.category
      FROM youtube y
      JOIN gen_history gh ON y.gen_history_id = gh.id
      JOIN users u ON gh.user_id = u.id
      JOIN gallery g ON gh.gallery_id = g.id
      WHERE u.google_id = ${userId}
      ORDER BY y.created_at DESC
    `

    return result.map(item => ({
      youtubeId: item.youtube_id,
      description: item.youtube_description,
      youtubeUrl: item.youtube_url,
      tags: item.youtube_tags,
      createdAt: item.youtube_created_at,
      genHistoryId: item.gen_history_id,
      prompt: item.prompt,
      galleryId: item.gallery_id,
      galleryTitle: item.gallery_title,
      videoUrl: item.video_url,
      duration: item.duration,
      category: item.category
    }))
  } catch (error) {
    console.error('Error fetching user YouTube entries:', error)
    throw new Error('Failed to fetch user YouTube entries')
  }
}

/**
 * Update an existing YouTube entry
 * @param youtubeId - ID of the YouTube entry
 * @param description - Updated YouTube video description
 * @param youtubeUrl - Updated URL of the YouTube video
 * @param tags - Updated array of tags for the YouTube video
 * @returns The updated YouTube entry
 */
export async function updateYoutubeEntry(
  youtubeId: string,
  description?: string,
  youtubeUrl?: string,
  tags?: string[]
) {
  try {
    const updateFields = []
    const params = {}

    if (description !== undefined) {
      updateFields.push('description = ${description}')
      params.description = description
    }

    if (youtubeUrl !== undefined) {
      updateFields.push('youtube_url = ${youtubeUrl}')
      params.youtubeUrl = youtubeUrl
    }

    if (tags !== undefined) {
      updateFields.push('tags = ${tags}')
      params.tags = tags
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }

    updateFields.push('updated_at = NOW()')
    params.youtubeId = youtubeId

    const updateQuery = `
      UPDATE youtube
      SET ${updateFields.join(', ')}
      WHERE id = ${youtubeId}::uuid
      RETURNING id, gen_history_id, description, youtube_url, tags, created_at, updated_at
    `

    const result = await sql.unsafe(updateQuery, params)

    if (result && result.length > 0) {
      return result[0]
    }

    throw new Error('YouTube entry not found or update failed')
  } catch (error) {
    console.error('Error updating YouTube entry:', error)
    throw new Error('Failed to update YouTube entry')
  }
}

/**
 * Delete a YouTube entry
 * @param youtubeId - ID of the YouTube entry to delete
 * @returns Success status
 */
export async function deleteYoutubeEntry(youtubeId: string) {
  try {
    const result = await sql`
      DELETE FROM youtube
      WHERE id = ${youtubeId}::uuid
      RETURNING id
    `

    if (result && result.length > 0) {
      return { success: true, id: result[0].id }
    }

    throw new Error('YouTube entry not found or delete failed')
  } catch (error) {
    console.error('Error deleting YouTube entry:', error)
    throw new Error('Failed to delete YouTube entry')
  }
}
