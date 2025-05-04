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
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface StatsData {
  date?: string
  week?: string
  month?: string
  count: number
  duration: number
}

interface QualityData {
  name: string
  value: number
}

interface GenerationStatsProps {
  userId?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function GenerationStats({ userId }: GenerationStatsProps) {
  const [timeRange, setTimeRange] = useState('daily')
  const [dailyData, setDailyData] = useState<StatsData[]>([])
  const [weeklyData, setWeeklyData] = useState<StatsData[]>([])
  const [monthlyData, setMonthlyData] = useState<StatsData[]>([])
  const [qualityDistribution, setQualityDistribution] = useState<QualityData[]>(
    []
  )
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

        setDailyData(data.daily || [])
        setWeeklyData(data.weekly || [])
        setMonthlyData(data.monthly || [])
        setQualityDistribution(data.qualityDistribution || [])
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
              <XAxis dataKey={getDataKey()} />
              <YAxis />
              <Tooltip />
              <Bar dataKey='count' fill='#8884d8' name='Số video' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thời Lượng Video</CardTitle>
          <CardDescription>Tổng thời lượng video đã tạo (phút)</CardDescription>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={getChartData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey={getDataKey()} />
              <YAxis />
              <Tooltip />
              <Line
                type='monotone'
                dataKey='duration'
                stroke='#82ca9d'
                name='Thời lượng (phút)'
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phân Phối Chất Lượng</CardTitle>
          <CardDescription>
            Phân bố video theo mức chất lượng đã chọn
          </CardDescription>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={qualityDistribution}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {qualityDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
