'use client'
// app/dashboard/tabs/gallery/gallery.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, Share2, Bookmark, MoreHorizontal, Play, Clock, MessageSquare } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface GenHistory {
  id: string
  user_id: string
  prompt: string
  gallery_id: string | null
  created_at: string
}

interface GalleryEntry {
  id: string
  video_url: string
  title: string
  added_by: string
  created_at: string
}

export function VideoGallery() {
  const { data: session } = useSession()
  const [genHistories, setGenHistories] = useState<GenHistory[]>([])
  const [galleryEntries, setGalleryEntries] = useState<{
    [key: string]: GalleryEntry
  }>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const fetchHistories = async () => {
      setLoading(true)
      setError('')
      try {
        // Get user ID from session
        if (session?.user?.id) {
          setUserId(session.user.id)
          console.log('User ID viewing gallery:', session.user.id)
        }

        const response = await fetch('/api/gen_history/gen_gallery')

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Error loading gallery data')
        }

        const data = await response.json()
        setGenHistories(data.historyEntries || [])

        const entriesWithGalleryId = (data.historyEntries || []).filter(
          (history: GenHistory) => history.gallery_id
        )

        const galleryData: { [key: string]: GalleryEntry } = {}

        await Promise.all(
          entriesWithGalleryId.map(async (history: GenHistory) => {
            if (!history.gallery_id) return

            const galleryResponse = await fetch(
              `/api/gallery/${history.gallery_id}`
            )

            if (galleryResponse.ok) {
              const galleryEntryData = await galleryResponse.json()
              if (galleryEntryData.genHistory) {
                galleryData[history.gallery_id] = galleryEntryData.genHistory
              }
            }
          })
        )

        setGalleryEntries(galleryData)
      } catch (error) {
        console.error('Error:', error)
        setError(
          error instanceof Error
            ? error.message
            : 'An error occurred while loading data'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchHistories()
  }, [session])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return dateString
    }
  }

  // Use all history entries
  const displayedHistories = genHistories

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Videos</CardTitle>
          <CardDescription>
            Browse and manage your generated videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='py-6 text-center'>Loading data...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Videos</CardTitle>
          <CardDescription>
            Browse and manage your generated videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Videos</CardTitle>
        <CardDescription>
          Browse and manage your generated videos
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>


        {displayedHistories.length === 0 ? (
          <div className='flex h-40 flex-col items-center justify-center rounded-lg border border-dashed'>
            <p className='text-muted-foreground'>No videos found</p>
            <Button variant='link' className='mt-2'>
              Generate your first video
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {displayedHistories.map(history => {
              const galleryEntry = history.gallery_id
                ? galleryEntries[history.gallery_id]
                : null

              if (!galleryEntry) return null

              return (
                <Link
                  href={`/video/${galleryEntry.id}`}
                  key={history.id}
                  className='group relative overflow-hidden rounded-lg border bg-card block'
                >
                  <div className='relative aspect-video overflow-hidden'>
                    <video
                      src={galleryEntry.video_url}
                      muted
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                      onMouseOver={e => e.currentTarget.play()}
                      onMouseOut={e => {
                        e.currentTarget.pause()
                        e.currentTarget.currentTime = 0
                      }}
                    />
                    <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100'>
                      <Button
                        size='icon'
                        variant='secondary'
                        className='h-12 w-12 rounded-full'
                      >
                        <Play className='h-6 w-6' />
                      </Button>
                    </div>
                  </div>
                  <div className='p-3'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='font-medium'>{galleryEntry.title}</h3>
                        <div className='mt-2 flex items-start gap-2'>
                          <MessageSquare className='mt-1 h-4 w-4 flex-shrink-0 text-gray-500' />
                          <p className='line-clamp-2 text-xs text-gray-600'>
                            {history.prompt}
                          </p>
                        </div>
                        <div className='mt-2 flex items-center text-xs text-muted-foreground'>
                          <Clock className='mr-1.5 h-3.5 w-3.5 text-gray-400' />
                          <span>{formatDate(galleryEntry.created_at)}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem className='flex items-center gap-2'>
                            <Download className='h-4 w-4' />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className='flex items-center gap-2'>
                            <Share2 className='h-4 w-4' />
                            <span>Share</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className='flex items-center gap-2'>
                            <Bookmark className='h-4 w-4' />
                            <span>Save</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}