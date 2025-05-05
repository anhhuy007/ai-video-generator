'use server'
// app/service/usage.service.ts
import { sql } from '@/app/utils/database'

export async function getUserUsageStatistics(userId: string) {
  try {
    // Get total videos created
    const totalVideosResult = await sql`
      SELECT COUNT(*) as total
      FROM gallery g
      JOIN gen_history gh ON g.id = gh.gallery_id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId};
    `
    const totalVideos = parseInt(totalVideosResult[0]?.total || '0')

    // Get total duration
    const totalDurationResult = await sql`
      SELECT SUM(duration) as total
      FROM gallery g
      JOIN gen_history gh ON g.id = gh.gallery_id
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId};
    `
    const totalDuration = parseFloat(totalDurationResult[0]?.total || '0')

    // Get last generation time
    const lastGenResult = await sql`
      SELECT gh.created_at
      FROM gen_history gh
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      ORDER BY gh.created_at DESC
      LIMIT 1;
    `
    const lastGeneration = lastGenResult[0]?.created_at || null

    // Total prompts used
    const promptsUsedResult = await sql`
      SELECT COUNT(DISTINCT prompt) as total
      FROM gen_history gh
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId};
    `
    const promptsUsed = parseInt(promptsUsedResult[0]?.total || '0')

    // Find peak day with more accurate counting
    const peakDayResult = await sql`
      SELECT 
        EXTRACT(DOW FROM gh.created_at) as day_of_week,
        COUNT(*) as count
      FROM gen_history gh
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY day_of_week
      ORDER BY count DESC
      LIMIT 1;
    `
    const dayOfWeekMap = [
      'Chủ nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7'
    ]
    const peakDay = peakDayResult[0]?.day_of_week
      ? dayOfWeekMap[parseInt(peakDayResult[0].day_of_week)]
      : 'Không có dữ liệu'

    // Find peak time
    const peakTimeResult = await sql`
      SELECT 
        EXTRACT(HOUR FROM gh.created_at) as hour,
        COUNT(*) as count
      FROM gen_history gh
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1;
    `
    const peakHour = peakTimeResult[0]?.hour
      ? parseInt(peakTimeResult[0].hour)
      : null
    const peakTime =
      peakHour !== null
        ? `${peakHour}:00 - ${(peakHour + 1) % 24}:00`
        : 'Không có dữ liệu'

    // Calculate usage trends - for the past 30 days vs previous 30 days
    const previousMonthCount = await sql`
      SELECT COUNT(*) as count
      FROM gen_history gh
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at BETWEEN CURRENT_DATE - INTERVAL '60 days' AND CURRENT_DATE - INTERVAL '30 days';
    `

    const currentMonthCount = await sql`
      SELECT COUNT(*) as count
      FROM gen_history gh
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '30 days';
    `

    const previousCount = parseInt(previousMonthCount[0]?.count || '0')
    const currentCount = parseInt(currentMonthCount[0]?.count || '0')

    // Calculate percentage change
    let countTrend = 0
    if (previousCount > 0) {
      countTrend = Math.round(
        ((currentCount - previousCount) / previousCount) * 100
      )
    } else if (currentCount > 0) {
      countTrend = 100 // If previous count was 0 but current count is positive
    }

    // Calculate evening usage percentage (videos created between 18:00-24:00)
    const eveningUsageResult = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM gh.created_at) BETWEEN 18 AND 23) as evening_count,
        COUNT(*) as total_count
      FROM gen_history gh
      JOIN users u ON gh.user_id = u.id
      WHERE u.google_id = ${userId}
      AND gh.created_at >= CURRENT_DATE - INTERVAL '30 days';
    `

    let eveningUsagePercentage = 0
    if (parseInt(eveningUsageResult[0]?.total_count || '0') > 0) {
      eveningUsagePercentage = Math.round(
        (parseInt(eveningUsageResult[0]?.evening_count || '0') /
          parseInt(eveningUsageResult[0]?.total_count || '1')) *
          100
      )
    }

    // Get plan info from user's subscription
    // This would typically come from a subscription table in a real app
    const userPlanResult = await sql`
      SELECT plan_type, plan_limit, expiry_date
      FROM user_subscriptions
      WHERE user_id = (SELECT id FROM users WHERE google_id = ${userId})
      AND expiry_date > CURRENT_DATE
      ORDER BY expiry_date DESC
      LIMIT 1;
    `

    // Default values if no subscription found
    let planLimit = '100 phút/tháng'
    let planExpiry = '15/06/2025'

    if (userPlanResult.length > 0) {
      planLimit = `${userPlanResult[0].plan_limit} phút/tháng`
      const expiryDate = new Date(userPlanResult[0].expiry_date)
      planExpiry = `${expiryDate.getDate()}/${expiryDate.getMonth() + 1}/${expiryDate.getFullYear()}`
    }

    // Calculate usage as percentage of limit
    const planLimitNumber = parseInt(planLimit.split(' ')[0])
    const planUsage = Math.min(
      Math.round((totalDuration / planLimitNumber) * 100),
      100
    )

    return {
      totalVideos,
      totalDuration,
      lastGeneration,
      promptsUsed,
      peakDay,
      peakTime,
      planUsage,
      planLimit,
      planExpiry,
      countTrend,
      eveningUsagePercentage
    }
  } catch (error) {
    console.error('Error fetching usage statistics:', error)
    // Return fallback data in case of database error
    return {
      totalVideos: 0,
      totalDuration: 0,
      lastGeneration: null,
      promptsUsed: 0,
      peakDay: 'Không có dữ liệu',
      peakTime: 'Không có dữ liệu',
      planUsage: 0,
      planLimit: '100 phút/tháng',
      planExpiry: '15/06/2025',
      countTrend: 0,
      eveningUsagePercentage: 0
    }
  }
}
