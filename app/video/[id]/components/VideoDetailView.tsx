'use client'
// app/video/[id]/components/VideoDetailView.tsx
import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'

type VideoDetailViewProps = {
  galleryEntry: {
    id: string
    video_url: string
    title: string
    created_at: string
  }
  genHistory: {
    prompt: string
    created_at: string
  } | null
  creator: {
    name: string
    email: string
    avatar_url: string
  } | null
}

export default function VideoDetailView({
  galleryEntry,
  genHistory,
  creator
}: VideoDetailViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi })
  }

  return (
    <div className='flex flex-col gap-8 md:flex-row'>
      {/* Video Section - Left Side */}
      <div className='w-full md:w-2/3'>
        <div className='overflow-hidden rounded-lg bg-black shadow-lg'>
          <video
            src={galleryEntry.video_url}
            controls
            className='max-h-[500px] w-full object-contain'
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      </div>

      {/* Information Section - Right Side */}
      <div className='w-full md:w-1/3'>
        <div className='rounded-lg bg-white p-6 shadow-md'>
          <h3 className='mb-4 border-b pb-2 text-xl font-semibold'>
            Thông tin chi tiết
          </h3>

          <div className='space-y-4'>
            {/* Creator Information */}
            {creator && (
              <div>
                <h4 className='text-sm font-medium text-gray-500'>Người tạo</h4>
                <div className='mt-2 flex items-center'>
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt={creator.name || 'User'}
                      className='mr-2 h-8 w-8 rounded-full'
                    />
                  ) : (
                    <div className='mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200'>
                      <span className='text-sm text-gray-500'>
                        {(creator.name || creator.email || '?')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span>{creator.name || creator.email}</span>
                </div>
              </div>
            )}

            {/* Video Information */}
            <div>
              <h4 className='text-sm font-medium text-gray-500'>Tiêu đề</h4>
              <p className='mt-1'>{galleryEntry.title}</p>
            </div>

            {/* Prompt Information */}
            {genHistory && (
              <div>
                <h4 className='text-sm font-medium text-gray-500'>Prompt</h4>
                <p className='mt-1 rounded border border-gray-100 bg-gray-50 p-3 text-gray-700'>
                  {genHistory.prompt}
                </p>
              </div>
            )}

            {/* Created Date */}
            <div>
              <h4 className='text-sm font-medium text-gray-500'>
                Thời gian tạo
              </h4>
              <p className='mt-1'>{formatDate(galleryEntry.created_at)}</p>
            </div>

            {/* Additional buttons */}
            <div className='mt-4 border-t border-gray-200 pt-4'>
              <Link
                href='/'
                className='mr-2 inline-block rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300'
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
