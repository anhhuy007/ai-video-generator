// 'use server'

// import { neon } from '@neondatabase/serverless'
// import { ZodNullable } from 'zod'

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL is not defined in the environment variables.')
// }
// const sql = neon(process.env.DATABASE_URL)

// export async function createGoogleUser(
//   googleId: string,
//   email: string,
//   name?: string,
//   avatarUrl?: string
// ) {
//   // create a new user or update existing user
//   // using the googleId as the unique identifier
//   const result = await sql`
//     INSERT INTO users (google_id, email, name, avatar_url)
//     VALUES (${googleId}, ${email}, ${name ?? null}, ${avatarUrl ?? null})
//     ON CONFLICT (google_id) DO UPDATE
//     SET email = EXCLUDED.email, name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url
//     RETURNING *;
//   `
//   return result[0]
// }

// export async function createConversation(userId: string) {
//   const result = await sql`
//     INSERT INTO conversations (user_id)
//     VALUES (${userId})
//     RETURNING *;
//   `
//   return result[0]
// }

// export async function getConversationsForUser(userId: string) {
//   const result = await sql`
//     SELECT * FROM conversations
//     WHERE user_id = ${userId}
//     ORDER BY started_at DESC;
//   `
//   return result
// }

// export async function createUserRequest(
//   conversationId: string,
//   requestText: string
// ) {
//   const result = await sql`
//     INSERT INTO user_requests (conversation_id, request_text)
//     VALUES (${conversationId}, ${requestText})
//     RETURNING *;
//   `
//   return result[0]
// }

// export async function getUserRequestsForConversation(conversationId: string) {
//   const result = await sql`
//     SELECT * FROM user_requests
//     WHERE conversation_id = ${conversationId}
//     ORDER BY created_at ASC;
//   `
//   return result
// }

// export async function createAIResponse(
//   userRequestId: string,
//   videoUrl: string
// ) {
//   const result = await sql`
//     INSERT INTO ai_responses (user_request_id, video_url)
//     VALUES (${userRequestId}, ${videoUrl})
//     RETURNING *;
//   `
//   return result[0]
// }

// export async function getAIResponseForUserRequest(userRequestId: string) {
//   const result = await sql`
//     SELECT * FROM ai_responses
//     WHERE user_request_id = ${userRequestId}
//     ORDER BY created_at DESC
//     LIMIT 1;
//   `
//   return result[0]
// }

// export async function updateUser(
//   userId: string,
//   email?: string,
//   name?: string,
//   avatarUrl?: string
// ) {
//   const result = await sql`
//     UPDATE users
//     SET
//       email = ${email ?? null},
//       name = ${name ?? null},
//       avatar_url = ${avatarUrl ?? null},
//       updated_at = NOW()
//     WHERE id = ${userId}
//     RETURNING *;
//   `
//   return result[0]
// }

// export async function deleteConversation(conversationId: string) {
//   const result = await sql`
//     DELETE FROM conversations
//     WHERE id = ${conversationId}
//     RETURNING *;
//   `
//   return result[0]
// }

// export async function deleteUser(userId: string) {
//   const result = await sql`
//     DELETE FROM users
//     WHERE id = ${userId}
//     RETURNING *;
//   `
//   return result[0]
// }

// export async function getUserByGoogleId(googleId: string) {
//   const result = await sql`
//     SELECT * FROM users
//     WHERE google_id = ${googleId};
//   `
//   return result[0]
// }

// export async function getMessagesForConversation(conversationId: string) {
//   const userRequests = await sql`
//     SELECT * FROM user_requests
//     WHERE conversation_id = ${conversationId}
//     ORDER BY created_at ASC;
//   `

//   const messages = await Promise.all(
//     userRequests.map(async userRequest => {
//       const aiResponse = await sql`
//       SELECT * FROM ai_responses
//       WHERE user_request_id = ${userRequest.id}
//       ORDER BY created_at DESC
//       LIMIT 1;
//     `

//       return {
//         userRequest: userRequest,
//         aiResponse: aiResponse[0] || ZodNullable
//       }
//     })
//   )

//   return messages
// }
