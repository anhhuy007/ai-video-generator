'use server'

import { sql } from '@/app/utils/database'
// app/service/genHistory.service.ts
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
