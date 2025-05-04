'use server'
// app/service/galery.service.ts
import { sql } from '@/app/utils/database'

export async function createGalleryEntry(
  videoUrl: string,
  title: string,
  userId: string
) {
  const result = await sql`
    INSERT INTO gallery (video_url, title, added_by)
    VALUES (${videoUrl}, ${title}, ${userId})
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
