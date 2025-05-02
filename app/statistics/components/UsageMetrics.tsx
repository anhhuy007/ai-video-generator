'use client'

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
import {
  Clock,
  Video,
  Users,
  Zap,
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react'

export function UsageMetrics() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  // Giả lập dữ liệu thống kê người dùng
  const userStats = {
    totalVideos: 257,
    totalDuration: 128.5,
    avgQuality: 4.2,
    lastGeneration: '2 giờ trước',
    promptsUsed: 189,
    peakDay: 'Thứ 7',
    peakTime: '20:00 - 22:00',
    planUsage: 68, // phần trăm
    planLimit: '100 phút/tháng',
    planExpiry: '15/06/2025'
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Tổng Số Video</CardDescription>
            <CardTitle className='text-3xl'>
              <div className='flex items-center gap-2'>
                <Video className='h-6 w-6 text-primary' />
                {userStats.totalVideos}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Tạo gần đây: {userStats.lastGeneration}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Tổng Thời Lượng</CardDescription>
            <CardTitle className='text-3xl'>
              <div className='flex items-center gap-2'>
                <Clock className='h-6 w-6 text-primary' />
                {userStats.totalDuration} phút
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Trung bình:{' '}
              {(userStats.totalDuration / userStats.totalVideos).toFixed(1)}{' '}
              phút/video
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Số Lượng Từ Khóa</CardDescription>
            <CardTitle className='text-3xl'>
              <div className='flex items-center gap-2'>
                <Zap className='h-6 w-6 text-primary' />
                {userStats.promptsUsed}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              {(userStats.promptsUsed / userStats.totalVideos).toFixed(1)} từ
              khóa/video
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Đánh Giá Trung Bình</CardDescription>
            <CardTitle className='text-3xl'>
              <div className='flex items-center gap-2'>
                <Star className='h-6 w-6 text-primary' />
                {userStats.avgQuality}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Dựa trên {userStats.totalVideos} video đã tạo
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Thói Quen Sử Dụng</CardTitle>
            <CardDescription>
              Phân tích thời gian và ngày sử dụng
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='rounded-lg bg-muted p-4'>
                <div className='flex flex-col space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>Ngày Cao Điểm</span>
                  </div>
                  <span className='text-xl font-bold'>{userStats.peakDay}</span>
                </div>
              </div>

              <div className='rounded-lg bg-muted p-4'>
                <div className='flex flex-col space-y-2'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>Giờ Cao Điểm</span>
                  </div>
                  <span className='text-xl font-bold'>
                    {userStats.peakTime}
                  </span>
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
                  style={{ width: '70%' }}
                ></div>
              </div>
              <p className='text-xs text-muted-foreground'>
                70% hoạt động diễn ra từ 18:00 - 24:00
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiến Độ Sử Dụng Gói</CardTitle>
            <CardDescription>
              Sử dụng gói Pro của bạn trong tháng này
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col space-y-1'>
              <div className='flex items-center justify-between text-sm'>
                <span>Thời lượng đã sử dụng</span>
                <span className='font-medium'>
                  {(userStats.planUsage / 100) * parseInt(userStats.planLimit)}{' '}
                  / {userStats.planLimit}
                </span>
              </div>
              <div className='h-4 w-full rounded-full bg-secondary'>
                <div
                  className={`h-4 rounded-full ${userStats.planUsage > 80 ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${userStats.planUsage}%` }}
                ></div>
              </div>
              <p className='text-xs text-muted-foreground'>
                {userStats.planUsage}% đã sử dụng trong tháng này
              </p>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='flex flex-col space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Gói hiện tại</span>
                  <span className='font-semibold text-primary'>Pro</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Ngày gia hạn</span>
                  <span>{userStats.planExpiry}</span>
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

      <Card>
        <CardHeader>
          <CardTitle>Xu Hướng Sử Dụng</CardTitle>
          <CardDescription>
            Phân tích xu hướng sử dụng trong 30 ngày qua
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='flex items-center space-x-4 rounded-lg border p-4'>
              <div className='rounded-full bg-green-100 p-2'>
                <TrendingUp className='h-6 w-6 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Số lượng video</p>
                <p className='text-lg font-bold'>+27%</p>
              </div>
            </div>

            <div className='flex items-center space-x-4 rounded-lg border p-4'>
              <div className='rounded-full bg-blue-100 p-2'>
                <Clock className='h-6 w-6 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Thời lượng tạo</p>
                <p className='text-lg font-bold'>+14%</p>
              </div>
            </div>

            <div className='flex items-center space-x-4 rounded-lg border p-4'>
              <div className='rounded-full bg-purple-100 p-2'>
                <Star className='h-6 w-6 text-purple-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Chất lượng</p>
                <p className='text-lg font-bold'>+5%</p>
              </div>
            </div>
          </div>

          <div className='rounded-lg border p-4'>
            <h4 className='mb-2 text-sm font-medium'>Lời khuyên tối ưu</h4>
            <p className='text-sm text-muted-foreground'>
              Dựa trên mẫu sử dụng của bạn, thử tạo video vào buổi sáng để có
              kết quả tốt hơn. Người dùng có xu hướng nhận được chất lượng cao
              hơn 15% khi tạo video từ 8:00 - 11:00.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
