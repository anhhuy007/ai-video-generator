// app/history/components/VideoList.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

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

  useEffect(() => {
    const fetchHistories = async () => {
      setLoading(true)
      setError('')
      try {
        // Lấy thông tin user ID từ session
        if (session?.user?.id) {
          setUserId(session.user.id)
          console.log('User ID đang xem lịch sử:', session.user.id)
        }

        const response = await fetch('/api/gen_history')

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Lỗi khi tải lịch sử')
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
        console.error('Lỗi:', error)
        setError(
          error instanceof Error
            ? error.message
            : 'Đã xảy ra lỗi khi tải dữ liệu'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchHistories()
  }, [session])

  if (loading) {
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
    <div className='h-full overflow-y-auto pb-6'>
      {genHistories.length === 0 ? (
        <div className='py-6 text-center'>
          Không tìm thấy lịch sử video nào cho tài khoản này.
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
                <div className='p-3'>
                  <h3 className='truncate text-base font-medium'>
                    {galleryEntry.title}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
