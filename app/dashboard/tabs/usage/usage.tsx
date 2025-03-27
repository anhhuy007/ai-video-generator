'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

// Mock data for usage statistics
const dailyData = [
  { name: 'Mon', videos: 4, minutes: 2 },
  { name: 'Tue', videos: 3, minutes: 1.5 },
  { name: 'Wed', videos: 7, minutes: 3.5 },
  { name: 'Thu', videos: 5, minutes: 2.5 },
  { name: 'Fri', videos: 8, minutes: 4 },
  { name: 'Sat', videos: 12, minutes: 6 },
  { name: 'Sun', videos: 10, minutes: 5 }
]

const monthlyData = [
  { name: 'Jan', videos: 45, minutes: 22.5 },
  { name: 'Feb', videos: 52, minutes: 26 },
  { name: 'Mar', videos: 48, minutes: 24 },
  { name: 'Apr', videos: 70, minutes: 35 },
  { name: 'May', videos: 65, minutes: 32.5 },
  { name: 'Jun', videos: 85, minutes: 42.5 }
]

const resolutionData = [
  { name: '720p', value: 30 },
  { name: '1080p', value: 55 },
  { name: '4K', value: 15 }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

export function UsageStats() {
  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <Card className='col-span-2'>
        <CardHeader>
          <CardTitle>Generation Activity</CardTitle>
          <CardDescription>
            Track your video generation over time
          </CardDescription>
          <Tabs defaultValue='daily' className='w-full'>
            <TabsList className='grid w-full max-w-[200px] grid-cols-2'>
              <TabsTrigger value='daily'>Daily</TabsTrigger>
              <TabsTrigger value='monthly'>Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value='daily' className='h-[300px] w-full pt-4'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={dailyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey='videos'
                    fill='#8884d8'
                    name='Videos Generated'
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value='monthly' className='h-[300px] w-full pt-4'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey='videos'
                    fill='#82ca9d'
                    name='Videos Generated'
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resolution Usage</CardTitle>
          <CardDescription>Distribution of video resolutions</CardDescription>
        </CardHeader>
        <CardContent className='h-[300px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={resolutionData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={100}
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {resolutionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Your current plan and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Current Plan</span>
              <span className='text-primary font-semibold'>Pro</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Billing Cycle</span>
              <span>Monthly</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Next Billing Date</span>
              <span>April 15, 2025</span>
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Minutes Used</span>
                <span>42.5 / 100</span>
              </div>
              <div className='bg-secondary h-2 w-full rounded-full'>
                <div
                  className='bg-primary h-2 rounded-full'
                  style={{ width: '42.5%' }}
                ></div>
              </div>
              <p className='text-muted-foreground text-xs'>
                42.5% of your monthly allowance used
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
