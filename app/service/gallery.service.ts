'use server'
// app/service/statistics.service.ts
import { sql } from '@/app/utils/database'

export async function createGalleryEntry(
  videoUrl: string,
  title: string,
  userId: string,
  category: string | null,
  duration: number
) {
  let result

  if (category !== null) {
    result = await sql`
      INSERT INTO gallery (video_url, title, added_by, category, duration)
      VALUES (${videoUrl}, ${title}, ${userId}, ${category}, ${duration})
      RETURNING *;
    `
  } else {
    result = await sql`
      INSERT INTO gallery (video_url, title, added_by, duration)
      VALUES (${videoUrl}, ${title}, ${userId}, ${duration})
      RETURNING *;
    `
  }

  return result[0]
}



export async function getStatistics(userId: string) {
  try {
    // Daily statistics
    const dailyStats = await sql`
      SELECT 
        DATE(gh.created_at) as date,
        COUNT(*) as count,
        SUM(g.duration) as duration
      FROM gen_history gh
      JOIN gallery g ON gh.gallery_id = g.id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(gh.created_at)
      ORDER BY date;
    `

    // Weekly statistics
    const weeklyStats = await sql`
      SELECT 
        CONCAT('Tuần ', EXTRACT(WEEK FROM gh.created_at)) as week,
        COUNT(*) as count,
        SUM(g.duration) as duration
      FROM gen_history gh
      JOIN gallery g ON gh.gallery_id = g.id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '5 weeks'
      GROUP BY EXTRACT(WEEK FROM gh.created_at)
      ORDER BY EXTRACT(WEEK FROM gh.created_at);
    `

    // Monthly statistics
    const monthlyStats = await sql`
      SELECT 
        CONCAT('T', EXTRACT(MONTH FROM gh.created_at)) as month,
        COUNT(*) as count,
        SUM(g.duration) as duration
      FROM gen_history gh
      JOIN gallery g ON gh.gallery_id = g.id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '5 months'
      GROUP BY EXTRACT(MONTH FROM gh.created_at)
      ORDER BY EXTRACT(MONTH FROM gh.created_at);
    `

    return {
      daily: dailyStats.map(stat => ({
        date: stat.date.toISOString().split('T')[0],
        count: Number(stat.count),
        duration: Number(stat.duration) || 0
      })),
      weekly: weeklyStats.map(stat => ({
        week: stat.week,
        count: Number(stat.count),
        duration: Number(stat.duration) || 0
      })),
      monthly: monthlyStats.map(stat => ({
        month: stat.month,
        count: Number(stat.count),
        duration: Number(stat.duration) || 0
      }))
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
    throw new Error('Failed to fetch statistics')
  }
}

export async function getPromptStatistics(userId: string) {
  try {
    // Get prompt usage statistics
    const prompts = await sql`
      SELECT 
        p.id,
        p.text,
        COUNT(*) as count,
        ARRAY_AGG(DISTINCT t.name) as tags
      FROM prompts p
      JOIN prompt_usage pu ON p.id = pu.prompt_id
      JOIN users u ON pu.user_id = u.id
      LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE u.google_id = ${userId}
      GROUP BY p.id, p.text
      ORDER BY count DESC
      LIMIT 50;
    `

    // Get category statistics
    const categories = await sql`
      SELECT 
        c.name,
        COUNT(DISTINCT p.id) as count
      FROM categories c
      JOIN prompt_categories pc ON c.id = pc.category_id
      JOIN prompts p ON pc.prompt_id = p.id
      JOIN prompt_usage pu ON p.id = pu.prompt_id
      JOIN users u ON pu.user_id = u.id
      WHERE u.google_id = ${userId}
      GROUP BY c.name
      ORDER BY count DESC;
    `

    return {
      prompts: prompts.map(prompt => ({
        id: prompt.id,
        text: prompt.text,
        count: Number(prompt.count),
        tags: prompt.tags.filter(Boolean) // Filter out null values
      })),
      categories: categories.map(category => ({
        name: category.name,
        count: Number(category.count)
      }))
    }
  } catch (error) {
    console.error('Error fetching prompt statistics:', error)
    throw new Error('Failed to fetch prompt statistics')
  }
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
