'use server'

import { sql } from '@/app/utils/database'

export async function createGalleryEntry(videoUrl: string, addedBy: string) {
  const result = await sql`
    INSERT INTO gallery (video_url, added_by)
    VALUES (${videoUrl}, ${addedBy})
    RETURNING *;
  `
  return result[0]
}

export async function getGalleryEntries() {
  const result = await sql`
    SELECT * FROM gallery
    ORDER BY created_at DESC;
  `
  return result
}

export async function getGalleryEntryById(galleryId: string) {
  const result = await sql`
    SELECT * FROM gallery
    WHERE id = ${galleryId};
  `
  return result[0]
}
