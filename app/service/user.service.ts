'use server'

import { sql } from '@/app/utils/database'



export async function createGoogleUser(
  googleId: string,
  email: string,
  name?: string,
  avatarUrl?: string
) {
  // create a new user or update existing user
  // using the googleId as the unique identifier
  const result = await sql`
    INSERT INTO users (google_id, email, name, avatar_url)
    VALUES (${googleId}, ${email}, ${name ?? null}, ${avatarUrl ?? null})
    ON CONFLICT (google_id) DO UPDATE
    SET email = EXCLUDED.email, name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
    RETURNING *;
  `
  return result[0]
}

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
  return result[0]
}

export async function updateUser(
  userId: string,
  email?: string,
  name?: string,
  avatarUrl?: string
) {
  const result = await sql`
    UPDATE users
    SET
      email = ${email ?? null},
      name = ${name ?? null},
      avatar_url = ${avatarUrl ?? null},
      updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *;
  `
  return result[0]
}


export async function deleteUser(userId: string) {
  const result = await sql`
    DELETE FROM users
    WHERE id = ${userId}
    RETURNING *;
  `
  return result[0]
}

export async function getUserByGoogleId(googleId: string) {
  const result = await sql`
    SELECT * FROM users
    WHERE google_id = ${googleId};
  `
  return result[0]
}
