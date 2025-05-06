'use client'
// app/components/UsageMetrics.tsx
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Clock,
  Video,
  Zap,
  Calendar,
  TrendingUp,
  Award,
  Timer,
  BarChart3,
  History,
  User,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface UsageStats {
  totalVideos: number
  totalDuration: number // Đơn vị: giây
  lastGeneration: string | null
  longestVideo: { title: string; duration: number } | null // Đơn vị: giây
  avgDuration: number // Đơn vị: giây
  promptsUsed: number
  peakDay: string
  peakTime: string
  planUsage: number
  planLimit: string
  planExpiry: string
  planType: string
  countTrend: number
  eveningUsagePercentage: number
  weeklyDistribution: number[]
  timeDistribution: {
    morning: number
    afternoon: number
    evening: number
    night: number
  }
  monthlyTrends: { month: number; count: number }[]
  firstGeneration: string | null
  productiveDay: string
  mostUsedCategory: string
}

const formatTimeAgo = (dateString: string | null): string => {
  if (!dateString) return 'Không có dữ liệu'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins} phút trước`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays} ngày trước`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} tháng trước`
  return `${Math.floor(diffMonths / 12)} năm trước`
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Không có dữ liệu'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Cập nhật formatDuration để nhận đầu vào là giây
const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0 giây'
  if (seconds < 60) return `${Math.round(seconds)} giây`
  const minutes = seconds / 60
  const hrs = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return hrs > 0 ? `${hrs} giờ ${mins} phút` : `${mins} phút`
}

const OverviewTab = ({ usageStats }: { usageStats: UsageStats }) => (
  <TabsContent value='overview' className='space-y-6'>
    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Tổng Số Video</CardDescription>
          <CardTitle className='text-3xl'>
            <div className='flex items-center gap-2'>
              <Video className='h-6 w-6 text-primary' />
              {usageStats.totalVideos}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Tạo gần đây: {formatTimeAgo(usageStats.lastGeneration)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Tổng Thời Lượng</CardDescription>
          <CardTitle className='text-3xl'>
            <div className='flex items-center gap-2'>
              <Clock className='h-6 w-6 text-primary' />
              {formatDuration(usageStats.totalDuration)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Trung bình: {formatDuration(usageStats.avgDuration)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardDescription>Số Lượng Từ Khóa</CardDescription>
          <CardTitle className='text-3xl'>
            <div className='flex items-center gap-2'>
              <Zap className='h-6 w-6 text-primary' />
              {usageStats.promptsUsed}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            {usageStats.totalVideos > 0
              ? (usageStats.promptsUsed / usageStats.totalVideos).toFixed(1)
              : '0'}{' '}
            từ khóa/video
          </p>
        </CardContent>
      </Card>
    </div>
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Thói Quen Sử Dụng</CardTitle>
          <CardDescription>Phân tích thời gian và ngày sử dụng</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='rounded-lg bg-muted p-4'>
              <div className='flex flex-col space-y-2'>
                <div className='flex items-center space-x-2'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>Ngày Cao Điểm</span>
                </div>
                <span className='text-xl font-bold'>{usageStats.peakDay}</span>
              </div>
            </div>
            <div className='rounded-lg bg-muted p-4'>
              <div className='flex flex-col space-y-2'>
                <div className='flex items-center space-x-2'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>Giờ Cao Điểm</span>
                </div>
                <span className='text-xl font-bold'>{usageStats.peakTime}</span>
              </div>
            </div>
          </div>
          <div className='space-y-1'>
            <div className='flex items-center justify-between text-sm'>
              <span>Phân phối thời gian sử dụng</span>
              <span>Chủ yếu buổi tối</span>
            </div>
            <div className='h-2 w-full rounded-full bg-secondary'>
              <div
                className='h-2 rounded-full bg-primary'
                style={{ width: `${usageStats.eveningUsagePercentage}%` }}
              ></div>
            </div>
            <p className='text-xs text-muted-foreground'>
              {usageStats.eveningUsagePercentage}% hoạt động diễn ra từ 18:00 -
              24:00
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tiến Độ Sử Dụng Gói</CardTitle>
          <CardDescription>
            Sử dụng gói {usageStats.planType} của bạn trong tháng này
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col space-y-1'>
            <div className='flex items-center justify-between text-sm'>
              <span>Thời lượng đã sử dụng</span>
              <span className='font-medium'>
                {formatDuration(
                  (usageStats.planUsage / 100) *
                    parseInt(usageStats.planLimit.split(' ')[0]) *
                    60
                )}{' '}
                / {usageStats.planLimit}
              </span>
            </div>
            <div className='h-4 w-full rounded-full bg-secondary'>
              <div
                className={`h-4 rounded-full ${usageStats.planUsage > 80 ? 'bg-red-500' : 'bg-primary'}`}
                style={{ width: `${usageStats.planUsage}%` }}
              ></div>
            </div>
            <p className='text-xs text-muted-foreground'>
              {usageStats.planUsage}% đã sử dụng trong tháng này
            </p>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='flex flex-col space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Gói hiện tại</span>
                <span className='font-semibold text-primary'>
                  {usageStats.planType}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Ngày gia hạn</span>
                <span>{usageStats.planExpiry}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Chu kỳ thanh toán</span>
                <span>Hàng tháng</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className='w-full'>Nâng Cấp Gói</Button>
        </CardFooter>
      </Card>
    </div>
  </TabsContent>
)

const TrendsTab = ({ usageStats }: { usageStats: UsageStats }) => {
  const timeDistributionData = [
    { name: 'Sáng', value: usageStats.timeDistribution.morning },
    { name: 'Chiều', value: usageStats.timeDistribution.afternoon },
    { name: 'Tối', value: usageStats.timeDistribution.evening },
    { name: 'Đêm', value: usageStats.timeDistribution.night }
  ]
  const weeklyDistributionData = usageStats.weeklyDistribution.map(
    (value, index) => ({
      name: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][index],
      videos: value
    })
  )
  const monthlyTrendsData = usageStats.monthlyTrends.map(item => ({
    name: [
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
      'T6',
      'T7',
      'T8',
      'T9',
      'T10',
      'T11',
      'T12'
    ][item.month - 1],
    videos: item.count
  }))
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <TabsContent value='trends' className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Xu Hướng Sử Dụng</CardTitle>
          <CardDescription>
            Phân tích xu hướng sử dụng trong 30 ngày qua
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-center space-x-4 rounded-lg border p-4'>
              <div
                className={`rounded-full ${usageStats.countTrend >= 0 ? 'bg-green-100' : 'bg-red-100'} p-2`}
              >
                {usageStats.countTrend >= 0 ? (
                  <ArrowUp className='h-6 w-6 text-green-600' />
                ) : (
                  <ArrowDown className='h-6 w-6 text-red-600' />
                )}
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Số lượng video</p>
                <p className='text-lg font-bold'>
                  {usageStats.countTrend >= 0 ? '+' : ''}
                  {usageStats.countTrend}%
                </p>
                <p className='text-sm text-muted-foreground'>
                  so với 30 ngày trước
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-4 rounded-lg border p-4'>
              <div className='rounded-full bg-blue-100 p-2'>
                <Clock className='h-6 w-6 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Thời lượng trung bình
                </p>
                <p className='text-lg font-bold'>
                  {formatDuration(usageStats.avgDuration)}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Tổng cộng {formatDuration(usageStats.totalDuration)}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h4 className='mb-3 text-sm font-medium'>
              Phân phối theo thời gian trong ngày
            </h4>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={timeDistributionData}
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
                    {timeDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={value => [`${value} video`, 'Số lượng']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h4 className='mb-3 text-sm font-medium'>
              Phân phối theo ngày trong tuần
            </h4>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={weeklyDistributionData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip
                    formatter={value => [`${value} video`, 'Số lượng']}
                  />
                  <Bar dataKey='videos' fill='#8884d8' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className='rounded-lg border p-4'>
            <h4 className='mb-2 text-sm font-medium'>Lời khuyên tối ưu</h4>
            <p className='text-sm text-muted-foreground'>
              Dựa trên mẫu sử dụng của bạn, thử tạo video vào buổi sáng (8:00 -
              11:00) để có kết quả tốt hơn. Người dùng có xu hướng nhận được
              hiệu suất cao hơn 15% khi tạo video vào khung giờ này.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Xu Hướng Theo Tháng</CardTitle>
          <CardDescription>
            Số lượng video được tạo mỗi tháng trong năm nay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip formatter={value => [`${value} video`, 'Số lượng']} />
                <Bar dataKey='videos' fill='#4f46e5' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

const DetailsTab = ({ usageStats }: { usageStats: UsageStats }) => {
  const accountAge = usageStats.firstGeneration
    ? Math.floor(
        (new Date().getTime() -
          new Date(usageStats.firstGeneration).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  return (
    <TabsContent value='details' className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Chi Tiết Video</CardTitle>
            <CardDescription>
              Thông tin chi tiết về video của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4'>
              {usageStats.longestVideo && (
                <div className='rounded-lg border p-4'>
                  <div className='flex flex-col space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <Timer className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm font-medium'>
                        Video dài nhất
                      </span>
                    </div>
                    <span className='font-semibold'>
                      {usageStats.longestVideo.title}
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      {formatDuration(usageStats.longestVideo.duration)}
                    </span>
                  </div>
                </div>
              )}
              <div className='rounded-lg border p-4'>
                <div className='flex flex-col space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <BarChart3 className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      Thể loại phổ biến nhất
                    </span>
                  </div>
                  <span className='text-lg font-semibold'>
                    {usageStats.mostUsedCategory}
                  </span>
                </div>
              </div>
              <div className='rounded-lg border p-4'>
                <div className='flex flex-col space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <Award className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      Ngày sáng tạo nhất
                    </span>
                  </div>
                  <span className='text-lg font-semibold'>
                    {usageStats.productiveDay}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chi Tiết Tài Khoản</CardTitle>
            <CardDescription>
              Thông tin về tài khoản và hoạt động của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4'>
              <div className='rounded-lg border p-4'>
                <div className='flex flex-col space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <User className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      Thời gian sử dụng
                    </span>
                  </div>
                  <span className='text-lg font-semibold'>
                    {accountAge} ngày
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    Tài khoản được tạo: {formatDate(usageStats.firstGeneration)}
                  </span>
                </div>
              </div>
              <div className='rounded-lg border p-4'>
                <div className='flex flex-col space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <History className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      Hoạt động gần đây
                    </span>
                  </div>
                  <span className='text-lg font-semibold'>
                    {formatTimeAgo(usageStats.lastGeneration)}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    Lần tạo video cuối: {formatDate(usageStats.lastGeneration)}
                  </span>
                </div>
              </div>
            </div>
            <div className='rounded-lg border p-4'>
              <h4 className='mb-2 text-sm font-medium'>Thống kê sử dụng</h4>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Tổng số video:
                  </span>
                  <span className='font-medium'>{usageStats.totalVideos}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Tổng thời lượng:
                  </span>
                  <span className='font-medium'>
                    {formatDuration(usageStats.totalDuration)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Trung bình mỗi video:
                  </span>
                  <span className='font-medium'>
                    {formatDuration(usageStats.avgDuration)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Tổng từ khóa đã dùng:
                  </span>
                  <span className='font-medium'>{usageStats.promptsUsed}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  )
}

export function UsageTabs() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchUsageStats = async () => {
    setIsLoading(true)
    setError('')
    try {
      if (!session?.user?.id) throw new Error('No user session')
      const response = await fetch(
        `/api/statistics/usage?userId=${session.user.id}`
      )
      if (!response.ok) throw new Error('Failed to fetch usage statistics')
      const data = await response.json()
      setUsageStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) fetchUsageStats()
  }, [session])

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-12 w-full' />
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className='pb-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-8 w-32' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-4 w-full' />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
        {error}
        <Button onClick={fetchUsageStats} className='ml-4'>
          Thử lại
        </Button>
      </div>
    )
  }

  if (!usageStats) return null

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid grid-cols-3'>
          <TabsTrigger value='overview'>Tổng Quan</TabsTrigger>
          <TabsTrigger value='trends'>Phân Tích Xu Hướng</TabsTrigger>
          <TabsTrigger value='details'>Chi Tiết Sử Dụng</TabsTrigger>
        </TabsList>
        <OverviewTab usageStats={usageStats} />
        <TrendsTab usageStats={usageStats} />
        <DetailsTab usageStats={usageStats} />
      </Tabs>
    </div>
  )
}
