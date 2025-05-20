'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Search, Copy, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'react-toastify'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Interfaces
interface Prompt {
  id: string
  text: string
  count: number
  tags: string[]
}

interface Category {
  name: string
  count: number
}

interface PopularPromptsProps {
  userId?: string
}

export function PopularPrompts({ userId }: PopularPromptsProps) {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Prompt>('count')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPrompts = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/statistics/prompts?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }
      const data = await response.json()
      setPrompts(data.prompts || [])
      setCategories(data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data')
    } finally {
      setIsLoading(false)
    }
  }

  const hasFetched = useRef(false)

  useEffect(() => {
    if (!userId || hasFetched.current) return

    fetchPrompts()
    hasFetched.current = true
  }, [userId])

  const filteredPrompts = prompts
    .filter(
      prompt =>
        prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .sort((a, b) => {
      const valueA = a[sortField]
      const valueB = b[sortField]
      if (sortDirection === 'asc') {
        return valueA < valueB ? -1 : 1
      }
      return valueA > valueB ? -1 : 1
    })

  const handleSort = (field: keyof Prompt) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const copyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText)
    toast.success('Prompt copied to clipboard', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    })
  }

  if (isLoading) {
    return <div className='py-6 text-center'>Loading data...</div>
  }

  if (error) {
    return (
      <div className='rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
        {error}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-6 md:flex-row'>
        <Card className='flex-1'>
          <CardHeader>
            <CardTitle>Popular Prompts</CardTitle>
            <CardDescription>Your most frequently used prompts</CardDescription>
            <div className='relative mt-2'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search prompts...'
                className='pl-8'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt</TableHead>
                  <TableHead
                    className='w-[100px] cursor-pointer'
                    onClick={() => handleSort('count')}
                  >
                    <div className='flex items-center'>
                      Count
                      {sortField === 'count' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className='ml-1 h-4 w-4' />
                        ) : (
                          <ChevronDown className='ml-1 h-4 w-4' />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className='w-[150px]'>Tags</TableHead>
                  <TableHead className='w-[100px]'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center'>
                      No prompts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrompts.map(prompt => (
                    <TableRow key={prompt.id}>
                      <TableCell className='font-medium'>
                        {prompt.text}
                      </TableCell>
                      <TableCell>{prompt.count}</TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {prompt.tags.map(tag => (
                            <Badge key={tag} variant='secondary'>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => copyPrompt(prompt.text)}
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className='w-full md:w-[400px]'>
          <CardHeader>
            <CardTitle>Prompt Categories</CardTitle>
            <CardDescription>Number of prompts by category</CardDescription>
          </CardHeader>
          <CardContent className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={categories}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='count' fill='#8884d8' name='Number of prompts' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
