// app/history/components/VideoList.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Clock, MessageSquare } from 'lucide-react'

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

export default function VideoList() {
  const { data: session } = useSession()
  const [genHistories, setGenHistories] = useState<GenHistory[]>([])
  const [galleryEntries, setGalleryEntries] = useState<{
    [key: string]: GalleryEntry
  }>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  const fetchHistories = async () => {
    setLoading(true)
    setError('')

    try {
      // Get user ID from session
      if (session?.user?.id) {
        setUserId(session.user.id)
        console.log('User ID viewing history:', session.user.id)
      }

      const response = await fetch('/api/gen_history')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error loading history')
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

  const hasFetched = useRef(false)
  useEffect(() => {
    if (session?.user?.id && !hasFetched.current) {
      fetchHistories()
      hasFetched.current = true
    }
  }, [session?.user?.id])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return dateString
    }
  }

  if (loading) {
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
    <div className='h-full overflow-y-auto pb-6'>
      {genHistories.length === 0 ? (
        <div className='py-6 text-center'>
          No video history found for this account.
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {genHistories.map(history => {
            const galleryEntry = history.gallery_id
              ? galleryEntries[history.gallery_id]
              : null

            if (!galleryEntry) return null

            return (
              <Link
                key={history.id}
                href={`/video/${galleryEntry.id}`}
                className='block overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md'
              >
                <div className='aspect-video'>
                  <video
                    src={galleryEntry.video_url}
                    muted
                    className='h-full w-full object-cover'
                    onMouseOver={e => e.currentTarget.play()}
                    onMouseOut={e => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = 0
                    }}
                  />
                </div>
                <div className='p-4'>
                  <h3 className='truncate text-base font-semibold'>
                    {galleryEntry.title}
                  </h3>

                  <div className='mt-2 flex items-start gap-2'>
                    <MessageSquare className='mt-1 h-4 w-4 flex-shrink-0 text-gray-500' />
                    <p className='line-clamp-2 text-sm text-gray-600'>
                      {history.prompt}
                    </p>
                  </div>

                  <div className='mt-2 flex items-center text-xs text-gray-500'>
                    <Clock className='mr-1.5 h-3.5 w-3.5 text-gray-400' />
                    <span>{formatDate(galleryEntry.created_at)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
