'use server'

import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the environment variables.')
}
const sql = neon(process.env.DATABASE_URL)

export async function createUser(
  googleId: string,
  email: string,
  name?: string,
  avatarUrl?: string
) {
  const result = await sql`
    INSERT INTO users (google_id, email, name, avatar_url)
    VALUES (${googleId}, ${email}, ${name ?? null}, ${avatarUrl ?? null})
    ON CONFLICT (google_id) DO UPDATE
    SET email = EXCLUDED.email, name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
    RETURNING *;
  `
  return result[0] // Return the created/updated user
}
