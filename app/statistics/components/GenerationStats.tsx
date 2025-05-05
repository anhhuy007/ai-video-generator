'use client'
// app/statistics/components/GenerationStats.tsx
import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface StatsData {
  date?: string
  week?: string
  month?: string
  count: number
  duration: number
}

interface GenerationStatsProps {
  userId?: string
}

export function GenerationStats({ userId }: GenerationStatsProps) {
  const [timeRange, setTimeRange] = useState('daily')
  const [dailyData, setDailyData] = useState<StatsData[]>([])
  const [weeklyData, setWeeklyData] = useState<StatsData[]>([])
  const [monthlyData, setMonthlyData] = useState<StatsData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return

    const fetchStats = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await fetch(`/api/statistics?userId=${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }
        const data = await response.json()

        // Ensure we have data for all days even if no videos were created
        const today = new Date()
        const dailyDataMap = new Map()

        // Create entries for the past 14 days (increased from 7 to match the backend)
        for (let i = 13; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          dailyDataMap.set(dateStr, { date: dateStr, count: 0, duration: 0 })
        }

        // Update with actual data
        ;(data.daily || []).forEach((entry: StatsData) => {
          if (dailyDataMap.has(entry.date)) {
            dailyDataMap.set(entry.date, entry)
          }
        })

        // Sort daily data by date
        const sortedDailyData = Array.from(dailyDataMap.values()).sort(
          (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
        )

        setDailyData(sortedDailyData)
        setWeeklyData(data.weekly || [])
        setMonthlyData(data.monthly || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  const getChartData = () => {
    switch (timeRange) {
      case 'daily':
        return dailyData
      case 'weekly':
        return weeklyData
      case 'monthly':
        return monthlyData
      default:
        return dailyData
    }
  }

  const getDataKey = () => {
    switch (timeRange) {
      case 'daily':
        return 'date'
      case 'weekly':
        return 'week'
      case 'monthly':
        return 'month'
      default:
        return 'date'
    }
  }

  const formatXAxis = (value: string) => {
    if (timeRange === 'daily') {
      try {
        const date = new Date(value)
        return `${date.getDate()}/${date.getMonth() + 1}`
      } catch {
        return value
      }
    }
    return value
  }

  // Helper function to format duration from seconds to minutes:seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return <div className='py-6 text-center'>Đang tải dữ liệu...</div>
  }

  if (error) {
    return (
      <div className='rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
        {error}
      </div>
    )
  }

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      <Card className='col-span-2'>
        <CardHeader>
          <CardTitle>Số Lượng Video Đã Tạo</CardTitle>
          <CardDescription>
            Theo dõi số lượng video bạn đã tạo theo thời gian
          </CardDescription>
          <Tabs
            defaultValue='daily'
            value={timeRange}
            onValueChange={setTimeRange}
            className='w-full'
          >
            <TabsList className='grid w-full max-w-[300px] grid-cols-3'>
              <TabsTrigger value='daily'>Hàng ngày</TabsTrigger>
              <TabsTrigger value='weekly'>Hàng tuần</TabsTrigger>
              <TabsTrigger value='monthly'>Hàng tháng</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={getChartData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey={getDataKey()} tickFormatter={formatXAxis} />
              <YAxis allowDecimals={false} domain={[0, 'auto']} />
              <Tooltip
                formatter={(value: number) => [value, 'Số video']}
                labelFormatter={value => {
                  if (timeRange === 'daily') {
                    try {
                      const date = new Date(value)
                      return `Ngày ${date.getDate()}/${date.getMonth() + 1}`
                    } catch {
                      return value
                    }
                  }
                  return value
                }}
              />
              <Bar dataKey='count' fill='#8884d8' name='Số video' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className='col-span-2'>
        <CardHeader>
          <CardTitle>Thời Lượng Video</CardTitle>
          <CardDescription>Tổng thời lượng video đã tạo (giây)</CardDescription>
          <Tabs
            defaultValue='daily'
            value={timeRange}
            onValueChange={setTimeRange}
            className='w-full'
          >
            <TabsList className='grid w-full max-w-[300px] grid-cols-3'>
              <TabsTrigger value='daily'>Hàng ngày</TabsTrigger>
              <TabsTrigger value='weekly'>Hàng tuần</TabsTrigger>
              <TabsTrigger value='monthly'>Hàng tháng</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={getChartData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey={getDataKey()} tickFormatter={formatXAxis} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [
                  formatDuration(value),
                  'Thời lượng'
                ]}
                labelFormatter={value => {
                  if (timeRange === 'daily') {
                    try {
                      const date = new Date(value)
                      return `Ngày ${date.getDate()}/${date.getMonth() + 1}`
                    } catch {
                      return value
                    }
                  }
                  return value
                }}
              />
              <Line
                type='monotone'
                dataKey='duration'
                stroke='#82ca9d'
                name='Thời lượng (giây)'
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
