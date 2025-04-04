'use server'

import { sql } from '@/app/utils/database'

export async function createGenHistory(
  userId: string,
  prompt: string,
  galleryId?: string
) {
  const result = await sql`
    INSERT INTO gen_history (user_id, prompt, gallery_id)
    VALUES (${userId}, ${prompt}, ${galleryId ?? null})
    RETURNING *;
  `
  return result[0]
}

export async function getGenHistoryForUser(userId: string) {
  const result = await sql`
    SELECT * FROM gen_history
    WHERE user_id = ${userId}
    ORDER BY created_at DESC;
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
