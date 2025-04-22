'use server'

import { sql } from '@/app/utils/database'
// app/service/genHistory.service.ts

// Add this new function
export async function getGenHistoryForGallery(galleryId: string) {
  const result = await sql`
    SELECT * FROM gen_history
    WHERE gallery_id = ${galleryId}
    ORDER BY created_at DESC;
  `
  return result
}

// Existing functions
export async function createGenHistory(
  googleId: string,
  prompt: string,
  galleryId?: string
) {
  // Get userId from googleId
  const userResult = await sql`
    SELECT id FROM users WHERE google_id = ${googleId};
  `

  if (userResult.length === 0) {
    throw new Error('User not found')
  }

  const userId = userResult[0].id

  // Add to gen_history table
  const result = await sql`
    INSERT INTO gen_history (user_id, prompt, gallery_id)
    VALUES (${userId}, ${prompt}, ${galleryId ?? null})
    RETURNING *;
  `

  return result[0]
}

export async function getGenHistoryForUser(googleId: string) {
  const result = await sql`
    SELECT gh.*
    FROM gen_history gh
    JOIN users u ON gh.user_id = u.id
    WHERE u.google_id = ${googleId}
    ORDER BY gh.created_at DESC;
  `
  return result
}

export async function getGenHistoryById(historyId: string) {
  const result = await sql`
    SELECT * FROM gen_history
    WHERE id = ${historyId};
  `
  return result[0]
}
