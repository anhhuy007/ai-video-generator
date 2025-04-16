// app/history/components/VideoList.tsx
'use client'
import { useState, useEffect } from 'react'

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

export default function VideoList({ userId }: { userId: string }) {
  const [genHistories, setGenHistories] = useState<GenHistory[]>([])
  const [galleryEntries, setGalleryEntries] = useState<{
    [key: string]: GalleryEntry
  }>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchHistories = async () => {
      setLoading(true)
      setError('')
      try {
        // Fetch gen histories - Use query parameter instead of body
        const response = await fetch(
          `/api/gen_history?userId=${encodeURIComponent(userId)}`
        )

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Lỗi khi tải lịch sử')
        }

        const data = await response.json()
        setGenHistories(data.historyEntries || [])

        // Fetch gallery entries for each history with gallery_id
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
  }, [userId])

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

  if (genHistories.length === 0) {
    return (
      <div className='py-6 text-center'>
        Không tìm thấy lịch sử video nào cho User ID này.
      </div>
    )
  }

  return (
    <div>
      <h2 className='mb-4 text-xl font-semibold'>
        Lịch sử video ({genHistories.length})
      </h2>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {genHistories.map(history => {
          const galleryEntry = history.gallery_id
            ? galleryEntries[history.gallery_id]
            : null

          return (
            <div
              key={history.id}
              className='overflow-hidden rounded-lg bg-white shadow-md'
            >
              {galleryEntry && (
                <div className='aspect-video'>
                  <video
                    src={galleryEntry.video_url}
                    controls
                    className='h-full w-full object-cover'
                  />
                </div>
              )}

              <div className='p-4'>
                <h3 className='mb-2 text-lg font-bold'>
                  {galleryEntry ? galleryEntry.title : 'Video chưa được tạo'}
                </h3>

                <div className='mb-2 text-sm text-gray-600'>
                  <p>
                    Ngày tạo:{' '}
                    {new Date(history.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className='mt-3'>
                  <p className='text-sm text-gray-700'>
                    <span className='font-semibold'>Prompt:</span>{' '}
                    {history.prompt}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
