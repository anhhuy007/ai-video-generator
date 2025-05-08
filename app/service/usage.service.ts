'use server'
// app/service/usage.service.ts
import { sql } from '@/app/utils/database'
import { cache } from 'react'

// Function to convert seconds to minutes
const secondsToMinutes = (seconds: number): number => seconds / 60

export interface UsageStatistics {
  totalVideos: number
  totalDuration: number // Unit: seconds
  longestVideo: { title: string; duration: number } | null // Unit: seconds
  avgDuration: number // Unit: seconds
  productiveDay: string
  mostUsedCategory: string
  lastGeneration: string | null
  firstGeneration: string | null
  promptsUsed: number
  monthlyTrends: { month: number; count: number }[]
  peakDay: string
  peakTime: string
  weeklyDistribution: number[]
  timeDistribution: {
    morning: number
    afternoon: number
    evening: number
    night: number
  }
  planUsage: number // Percentage of plan usage
  planLimit: string // Limit (minutes/month)
  planExpiry: string
  planType: string
  countTrend: number
  eveningUsagePercentage: number
  recentVideos: {
    id: string
    title: string
    duration: number
    category: string | null
    createdAt: string
  }[] // Unit: seconds
  durationDistribution: { short: number; medium: number; long: number }
}

export interface VideoDetails {
  id: string
  title: string
  duration: number // Unit: seconds
  category: string | null
  createdAt: string
  prompt: string
}

export interface MetricComparison {
  metric: string
  userValue: number
  averageValue: number
  percentile: number
  isAboveAverage: boolean
}

const getTimeCondition = (timeframe: string) => {
  switch (timeframe) {
    case 'week':
      return "gh.created_at >= CURRENT_DATE - INTERVAL '7 days'"
    case 'month':
      return "gh.created_at >= CURRENT_DATE - INTERVAL '30 days'"
    case 'year':
      return "gh.created_at >= CURRENT_DATE - INTERVAL '365 days'"
    default:
      return ''
  }
}

const fetchCoreStats = async (userId: string, timeCondition: string) => {
  const statsResult = await sql`
    SELECT 
      COUNT(*) as total_videos,
      SUM(g.duration) as total_duration,
      AVG(g.duration) as avg_duration,
      MAX(g.duration) as max_duration,
      (SELECT g.title FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id WHERE g.duration = (SELECT MAX(duration) FROM gallery WHERE id = gh.gallery_id) AND gh.user_id = (SELECT id FROM users WHERE google_id = ${userId}) LIMIT 1) as longest_title,
      COUNT(DISTINCT gh.prompt) as prompts_used
    FROM gallery g
    JOIN gen_history gh ON g.id = gh.gallery_id
    JOIN users u ON gh.user_id = u.id
    WHERE u.google_id = ${userId}
    ${timeCondition ? sql`AND ${sql.unsafe(getTimeCondition(timeframe))}` : sql``}
  `
  return statsResult[0] || {}
}

const fetchTimeBasedStats = async (userId: string) => {
  const timeStats = await sql`
    SELECT 
      TO_CHAR(gh.created_at, 'Day') as productive_day,
      COUNT(*) as day_count,
      EXTRACT(DOW FROM gh.created_at) as peak_day,
      EXTRACT(HOUR FROM gh.created_at) as peak_hour,
      COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM gh.created_at) BETWEEN 5 AND 11) as morning,
      COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM gh.created_at) BETWEEN 12 AND 17) as afternoon,
      COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM gh.created_at) BETWEEN 18 AND 23) as evening,
      COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM gh.created_at) BETWEEN 0 AND 4 OR EXTRACT(HOUR FROM gh.created_at) = 24) as night
    FROM gen_history gh
    JOIN users u ON gh.user_id = u.id
    WHERE u.google_id = ${userId}
    AND gh.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY productive_day, peak_day, peak_hour
    ORDER BY day_count DESC
    LIMIT 1;
  `
  return timeStats[0] || {}
}

const fetchAdditionalStats = async (userId: string, timeCondition: string) => {
  const [categoryResult, lastGenResult, firstGenResult, monthlyTrendsResult] =
    await Promise.all([
      sql`SELECT g.category, COUNT(*) as count FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId} AND g.category IS NOT NULL ${timeCondition ? sql`AND ${sql.unsafe(getTimeCondition(timeframe))}` : sql``} GROUP BY g.category ORDER BY count DESC LIMIT 1;`,
      sql`SELECT gh.created_at FROM gen_history gh JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId} ORDER BY gh.created_at DESC LIMIT 1;`,
      sql`SELECT gh.created_at FROM gen_history gh JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId} ORDER BY gh.created_at ASC LIMIT 1;`,
      sql`SELECT EXTRACT(MONTH FROM gh.created_at) as month, COUNT(*) as count FROM gen_history gh JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId} AND EXTRACT(YEAR FROM gh.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) ${timeCondition ? sql`AND ${sql.unsafe(getTimeCondition(timeframe))}` : sql``} GROUP BY month ORDER BY month;`
    ])

  // Using default value since there's no user_subscriptions table
  const defaultPlan = {
    plan_type: 'Free',
    plan_limit: 100, // Limit of 100 minutes/month
    expiry_date: '2025-12-31 00:00:00'
  }

  return {
    category: categoryResult[0] || { category: 'N/A', count: 0 },
    lastGeneration: lastGenResult[0]?.created_at || null,
    firstGeneration: firstGenResult[0]?.created_at || null,
    monthlyTrends: monthlyTrendsResult.map(item => ({
      month: parseInt(item.month),
      count: parseInt(item.count)
    })),
    plan: defaultPlan
  }
}

const fetchDistributionStats = async (
  userId: string,
  timeCondition: string
) => {
  const [weeklyResult, recentVideosResult, durationResult] = await Promise.all([
    sql`SELECT EXTRACT(DOW FROM gh.created_at) as day_of_week, COUNT(*) as count FROM gen_history gh JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId} AND gh.created_at >= CURRENT_DATE - INTERVAL '30 days' GROUP BY day_of_week ORDER BY day_of_week;`,
    sql`SELECT g.id, g.title, g.duration, g.category, gh.created_at FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId} ${timeCondition ? sql`AND ${sql.unsafe(getTimeCondition(timeframe))}` : sql``} ORDER BY gh.created_at DESC LIMIT 5;`,
    sql`SELECT CASE WHEN duration < 30 THEN 'short' WHEN duration BETWEEN 30 AND 120 THEN 'medium' ELSE 'long' END as length_category, COUNT(*) as count FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId} ${timeCondition ? sql`AND ${sql.unsafe(getTimeCondition(timeframe))}` : sql``} GROUP BY length_category;`
  ])

  const weeklyDistribution = new Array(7).fill(0)
  weeklyResult.forEach(item => {
    weeklyDistribution[parseInt(item.day_of_week)] = parseInt(item.count)
  })

  const recentVideos = recentVideosResult.map(item => ({
    id: item.id,
    title: item.title,
    duration: parseFloat(item.duration || '0'), // Unit: seconds
    category: item.category,
    createdAt: item.created_at
  }))

  const durationDistribution = { short: 0, medium: 0, long: 0 }
  durationResult.forEach(item => {
    durationDistribution[item.length_category] = parseInt(item.count)
  })

  return { weeklyDistribution, recentVideos, durationDistribution }
}

const calculateTrends = async (userId: string) => {
  const [previousMonthCount, currentMonthCount] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM gen_history gh JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId} AND gh.created_at BETWEEN CURRENT_DATE - INTERVAL '60 days' AND CURRENT_DATE - INTERVAL '30 days';`,
    sql`SELECT COUNT(*) as count FROM gen_history gh JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId} AND gh.created_at >= CURRENT_DATE - INTERVAL '30 days';`
  ])

  const previousCount = parseInt(previousMonthCount[0]?.count || '0')
  const currentCount = parseInt(currentMonthCount[0]?.count || '0')
  let countTrend = 0
  if (previousCount > 0) {
    countTrend = Math.round(
      ((currentCount - previousCount) / previousCount) * 100
    )
  } else if (currentCount > 0) {
    countTrend = 100
  }
  return countTrend
}

export const getUserUsageStatistics = cache(
  async (
    userId: string,
    timeframe: string = 'all'
  ): Promise<UsageStatistics> => {
    try {
      const timeCondition = getTimeCondition(timeframe)

      const coreStats = await fetchCoreStats(userId, timeCondition)
      const totalVideos = parseInt(coreStats.total_videos || '0')
      const totalDuration = parseFloat(coreStats.total_duration || '0') // Unit: seconds
      const avgDuration = parseFloat(coreStats.avg_duration || '0') // Unit: seconds
      const longestVideo = coreStats.max_duration
        ? {
            title: coreStats.longest_title || 'N/A',
            duration: parseFloat(coreStats.max_duration)
          } // Unit: seconds
        : null
      const promptsUsed = parseInt(coreStats.prompts_used || '0')

      const timeStats = await fetchTimeBasedStats(userId)
      const productiveDay = timeStats?.productive_day?.trim() || 'N/A'
      const peakDay = timeStats?.peak_day
        ? [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
          ][parseInt(timeStats.peak_day)]
        : 'N/A'
      const peakTime = timeStats?.peak_hour
        ? `${timeStats.peak_hour}:00 - ${(parseInt(timeStats.peak_hour) + 1) % 24}:00`
        : 'N/A'
      const timeDistribution = {
        morning: parseInt(timeStats?.morning || '0'),
        afternoon: parseInt(timeStats?.afternoon || '0'),
        evening: parseInt(timeStats?.evening || '0'),
        night: parseInt(timeStats?.night || '0')
      }

      const additionalStats = await fetchAdditionalStats(userId, timeCondition)
      const mostUsedCategory = additionalStats.category.category || 'N/A'
      const lastGeneration = additionalStats.lastGeneration
      const firstGeneration = additionalStats.firstGeneration
      const monthlyTrends = additionalStats.monthlyTrends
      const plan = additionalStats.plan

      let planLimit = `${plan.plan_limit} minutes/month` // Limit in minutes
      let planExpiry = '12/31/2025'
      let planType = plan.plan_type
      const planLimitSeconds = plan.plan_limit * 60 // Convert limit from minutes to seconds
      const planUsage = Math.min(
        Math.round((totalDuration / planLimitSeconds) * 100),
        100
      ) // Calculate percentage based on seconds

      const distributionStats = await fetchDistributionStats(
        userId,
        timeCondition
      )
      const weeklyDistribution = distributionStats.weeklyDistribution
      const recentVideos = distributionStats.recentVideos
      const durationDistribution = distributionStats.durationDistribution

      const totalTimeCount =
        timeDistribution.morning +
        timeDistribution.afternoon +
        timeDistribution.evening +
        timeDistribution.night
      const eveningUsagePercentage =
        totalTimeCount > 0
          ? Math.round((timeDistribution.evening / totalTimeCount) * 100)
          : 0

      const countTrend = await calculateTrends(userId)

      return {
        totalVideos,
        totalDuration, // Unit: seconds
        longestVideo, // Unit: seconds
        avgDuration, // Unit: seconds
        productiveDay,
        mostUsedCategory,
        lastGeneration,
        firstGeneration,
        promptsUsed,
        monthlyTrends,
        peakDay,
        peakTime,
        weeklyDistribution,
        timeDistribution,
        planUsage,
        planLimit,
        planExpiry,
        planType,
        countTrend,
        eveningUsagePercentage,
        recentVideos, // Unit: seconds
        durationDistribution
      }
    } catch (error) {
      console.error('Error fetching usage statistics:', {
        message: error.message,
        stack: error.stack
      })
      throw new Error('Failed to fetch usage statistics')
    }
  }
)

export async function getVideoDetails(
  videoId: string,
  userId: string
): Promise<VideoDetails | null> {
  try {
    const videoResult = await sql`
      SELECT g.id, g.title, g.duration, g.category, gh.created_at, gh.prompt
      FROM gallery g
      JOIN gen_history gh ON g.id = gh.gallery_id
      JOIN users u ON gh.user_id = u.id
      WHERE g.id = ${videoId} AND u.google_id = ${userId}
    `

    if (videoResult.length === 0) {
      return null
    }

    return {
      id: videoResult[0].id,
      title: videoResult[0].title,
      duration: parseFloat(videoResult[0].duration || '0'), // Unit: seconds
      category: videoResult[0].category,
      createdAt: videoResult[0].created_at,
      prompt: videoResult[0].prompt
    }
  } catch (error) {
    console.error('Error fetching video details:', {
      message: error.message,
      stack: error.stack
    })
    throw new Error('Failed to fetch video details')
  }
}

export async function getMetricComparison(
  userId: string,
  metric: string
): Promise<MetricComparison | null> {
  try {
    if (!['totalVideos', 'totalDuration', 'avgDuration'].includes(metric)) {
      throw new Error('Invalid metric')
    }

    let userValueResult
    if (metric === 'totalVideos') {
      userValueResult =
        await sql`SELECT COUNT(*) as value FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId}`
    } else if (metric === 'totalDuration') {
      userValueResult =
        await sql`SELECT SUM(duration) as value FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId}`
    } else if (metric === 'avgDuration') {
      userValueResult =
        await sql`SELECT AVG(duration) as value FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id JOIN users u ON gh.user_id = u.id WHERE u.google_id = ${userId}`
    }
    const userValue = parseFloat(userValueResult[0]?.value || '0')

    let avgValueResult
    if (metric === 'totalVideos') {
      avgValueResult =
        await sql`SELECT AVG(user_count) as avg_value FROM (SELECT u.id, COUNT(*) as user_count FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id JOIN users u ON gh.user_id = u.id GROUP BY u.id) as user_counts`
    } else if (metric === 'totalDuration') {
      avgValueResult =
        await sql`SELECT AVG(user_duration) as avg_value FROM (SELECT u.id, SUM(duration) as user_duration FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id JOIN users u ON gh.user_id = u.id GROUP BY u.id) as user_durations`
    } else if (metric === 'avgDuration') {
      avgValueResult =
        await sql`SELECT AVG(user_avg) as avg_value FROM (SELECT u.id, AVG(duration) as user_avg FROM gallery g JOIN gen_history gh ON g.id = gh.gallery_id JOIN users u ON gh.user_id = u.id GROUP BY u.id) as user_avgs`
    }
    const avgValue = parseFloat(avgValueResult[0]?.avg_value || '0')

    const percentileResult = await sql`
      WITH user_metrics AS (
        SELECT u.id, 
          ${metric === 'totalVideos' ? 'COUNT(*)' : metric === 'totalDuration' ? 'SUM(duration)' : 'AVG(duration)'} as metric_value
        FROM gallery g
        JOIN gen_history gh ON g.id = gh.gallery_id
        JOIN users u ON gh.user_id = u.id
        GROUP BY u.id
      )
      SELECT PERCENT_RANK() OVER (ORDER BY metric_value) * 100 as percentile
      FROM user_metrics
      WHERE id = (SELECT id FROM users WHERE google_id = ${userId})
    `
    const percentile = Math.round(
      parseFloat(percentileResult[0]?.percentile || '0')
    )

    return {
      metric,
      userValue,
      averageValue: avgValue,
      percentile,
      isAboveAverage: userValue > avgValue
    }
  } catch (error) {
    console.error('Error getting metric comparison:', {
      message: error.message,
      stack: error.stack
    })
    throw new Error('Failed to get metric comparison')
  }
}

export async function getUserRecommendations(userId: string) {
  try {
    const productiveTimeResult = await sql`
      SELECT EXTRACT(HOUR FROM gh.created_at) as hour, AVG(g.duration) as avg_duration
      FROM gallery g
      JOIN gen_history gh ON g.id = gh.gallery_id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      GROUP BY hour
      ORDER BY avg_duration DESC
      LIMIT 1;
    `

    const successfulCategoryResult = await sql`
      SELECT g.category, AVG(g.duration) as avg_duration
      FROM gallery g
      JOIN gen_history gh ON g.id = gh.gallery_id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId} AND g.category IS NOT NULL
      GROUP BY g.category
      ORDER BY avg_duration DESC
      LIMIT 1;
    `

    const productiveHour = productiveTimeResult[0]?.hour
      ? parseInt(productiveTimeResult[0].hour)
      : null
    const successfulCategory = successfulCategoryResult[0]?.category || null

    return {
      productiveTimeRecommendation:
        productiveHour !== null
          ? `Try creating videos around ${productiveHour}:00 - ${(productiveHour + 1) % 24}:00 for best results.`
          : 'Try creating videos in the morning (8:00 - 11:00) for best results.',
      categoryRecommendation: successfulCategory
        ? `You seem to create the longest and highest quality videos in the "${successfulCategory}" category.`
        : 'Try focusing on a specific category to improve video quality.',
      generalRecommendation:
        'Users typically experience over 15% higher performance when using detailed and specific keywords.'
    }
  } catch (error) {
    console.error('Error generating recommendations:', {
      message: error.message,
      stack: error.stack
    })
    return {
      productiveTimeRecommendation:
        'Try creating videos in the morning (8:00 - 11:00) for best results.',
      categoryRecommendation:
        'Try focusing on a specific category to improve video quality.',
      generalRecommendation:
        'Users typically experience over 15% higher performance when using detailed and specific keywords.'
    }
  }
}
