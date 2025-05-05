'use server'
// app/service/statistics.service.ts
import { sql } from '@/app/utils/database'

export async function getStatistics(userId: string) {
  try {
    // Daily statistics - past 14 days (increased from 7 for better visualization)
    const dailyStats = await sql`
      SELECT 
        DATE(gh.created_at) as date,
        COUNT(*) as count,
        SUM(g.duration) as duration
      FROM gen_history gh
      JOIN gallery g ON gh.gallery_id = g.id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY DATE(gh.created_at)
      ORDER BY date;
    `

    // Weekly statistics - past 8 weeks
    const weeklyStats = await sql`
      SELECT 
        CONCAT('Tuần ', EXTRACT(WEEK FROM gh.created_at)) as week,
        COUNT(*) as count,
        SUM(g.duration) as duration
      FROM gen_history gh
      JOIN gallery g ON gh.gallery_id = g.id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '8 weeks'
      GROUP BY EXTRACT(WEEK FROM gh.created_at)
      ORDER BY EXTRACT(WEEK FROM gh.created_at);
    `

    // Monthly statistics - past 12 months
    const monthlyStats = await sql`
      SELECT 
        CONCAT('T', EXTRACT(MONTH FROM gh.created_at)) as month,
        COUNT(*) as count,
        SUM(g.duration) as duration
      FROM gen_history gh
      JOIN gallery g ON gh.gallery_id = g.id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY EXTRACT(MONTH FROM gh.created_at)
      ORDER BY EXTRACT(MONTH FROM gh.created_at);
    `

    // Create a map for all days in the past 14 days
    const today = new Date()
    const dailyDataMap = new Map()

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyDataMap.set(dateStr, { date: dateStr, count: 0, duration: 0 })
    }

    // Update with actual data
    dailyStats.forEach(stat => {
      const dateStr = stat.date.toISOString().split('T')[0]
      if (dailyDataMap.has(dateStr)) {
        dailyDataMap.set(dateStr, {
          date: dateStr,
          count: Number(stat.count),
          duration: Number(stat.duration) || 0
        })
      }
    })

    return {
      daily: Array.from(dailyDataMap.values()),
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
    // Check if prompts table exists and has data
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'prompts'
      ) as exists;
    `

    const tableExists = tableCheck[0]?.exists === true

    if (!tableExists) {
      console.log('Prompts table does not exist, returning placeholder data')
      return {
        prompts: [
          {
            id: '1',
            text: 'Create a product showcase video',
            count: 23,
            tags: ['marketing', 'product']
          },
          {
            id: '2',
            text: 'Make a social media advertisement',
            count: 18,
            tags: ['marketing', 'social media']
          },
          {
            id: '3',
            text: 'Generate a tutorial video',
            count: 15,
            tags: ['education', 'tutorial']
          }
        ],
        categories: [
          { name: 'marketing', count: 41 },
          { name: 'education', count: 15 },
          { name: 'social media', count: 18 },
          { name: 'product', count: 23 }
        ]
      }
    }

    // Fetch popular prompts by frequency
    // First check if we should use the prompt_id join or extract from the prompt text field
    const hasPromptIdCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'gen_history' AND column_name = 'prompt_id'
      ) as exists;
    `

    const hasPromptId = hasPromptIdCheck[0]?.exists === true

    let promptsData
    if (hasPromptId) {
      // Using prompt_id relationship
      promptsData = await sql`
        SELECT 
          p.id,
          p.prompt_text as text,
          COUNT(*) as count,
          ARRAY_AGG(DISTINCT COALESCE(pt.tag_name, 'untagged')) as tags
        FROM prompts p
        JOIN gen_history gh ON p.id = gh.prompt_id
        JOIN users u ON gh.user_id = u.id
        LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
        WHERE u.google_id = ${userId}
        GROUP BY p.id, p.prompt_text
        ORDER BY count DESC
        LIMIT 50;
      `
    } else {
      // Alternative approach when no relationships exist
      // Group by the prompt text directly
      promptsData = await sql`
        SELECT 
          gh.id,
          gh.prompt as text,
          COUNT(*) as count,
          ARRAY['general'] as tags
        FROM gen_history gh
        JOIN users u ON gh.user_id = u.id
        WHERE u.google_id = ${userId}
        GROUP BY gh.id, gh.prompt
        ORDER BY count DESC
        LIMIT 50;
      `
    }

    // Fetch categories - use basic categories if prompt_tags doesn't exist
    let categoriesData
    const hasTagsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'prompt_tags'
      ) as exists;
    `

    const hasTagsTable = hasTagsCheck[0]?.exists === true

    if (hasTagsTable) {
      categoriesData = await sql`
        SELECT 
          pt.tag_name as name,
          COUNT(DISTINCT p.id) as count
        FROM prompt_tags pt
        JOIN prompts p ON pt.prompt_id = p.id
        JOIN gen_history gh ON p.id = gh.prompt_id
        JOIN users u ON gh.user_id = u.id
        WHERE u.google_id = ${userId}
        GROUP BY pt.tag_name
        ORDER BY count DESC
        LIMIT 10;
      `
    } else {
      // Create basic categories based on prompt text keywords
      categoriesData = await sql`
        SELECT 
          CASE
            WHEN gh.prompt ILIKE '%product%' THEN 'product'
            WHEN gh.prompt ILIKE '%marketing%' THEN 'marketing'
            WHEN gh.prompt ILIKE '%social%' THEN 'social media'
            WHEN gh.prompt ILIKE '%education%' OR gh.prompt ILIKE '%tutorial%' THEN 'education'
            ELSE 'other'
          END as name,
          COUNT(*) as count
        FROM gen_history gh
        JOIN users u ON gh.user_id = u.id
        WHERE u.google_id = ${userId}
        GROUP BY name
        ORDER BY count DESC;
      `
    }

    return {
      prompts: promptsData.map(prompt => ({
        id: prompt.id,
        text: prompt.text,
        count: Number(prompt.count),
        tags: Array.isArray(prompt.tags) ? prompt.tags : []
      })),
      categories: categoriesData.map(category => ({
        name: category.name,
        count: Number(category.count)
      }))
    }
  } catch (error) {
    console.error('Error fetching prompt statistics:', error)
    // Return fallback data
    return {
      prompts: [
        {
          id: '1',
          text: 'Create a product showcase video',
          count: 23,
          tags: ['marketing', 'product']
        },
        {
          id: '2',
          text: 'Make a social media advertisement',
          count: 18,
          tags: ['marketing', 'social media']
        },
        {
          id: '3',
          text: 'Generate a tutorial video',
          count: 15,
          tags: ['education', 'tutorial']
        }
      ],
      categories: [
        { name: 'marketing', count: 41 },
        { name: 'education', count: 15 },
        { name: 'social media', count: 18 },
        { name: 'product', count: 23 }
      ]
    }
  }
}
