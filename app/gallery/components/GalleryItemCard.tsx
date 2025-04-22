// app/gallery/components/GalleryItemCard.tsx
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

type GalleryItemProps = {
  id: string
  videoUrl: string
  title: string
  createdAt: string
}

export default function GalleryItemCard({
  id,
  videoUrl,
  title,
  createdAt
}: GalleryItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy', { locale: vi })
  }

  return (
    <div className='overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg'>
      <div className='relative aspect-video bg-black'>
        <video
          src={videoUrl}
          className='h-full w-full object-cover'
          muted
          onMouseOver={e => e.currentTarget.play()}
          onMouseOut={e => {
            e.currentTarget.pause()
            e.currentTarget.currentTime = 0
          }}
        />
        <div className='absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity hover:opacity-100'>
          <Link
            href={`/video/${id}`}
            className='rounded bg-white px-4 py-2 font-medium text-black transition-colors hover:bg-gray-100'
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
      <div className='p-4'>
        <h3 className='truncate text-lg font-semibold'>{title}</h3>
        <p className='mt-1 text-sm text-gray-500'>
          Đăng tải: {formatDate(createdAt)}
        </p>
      </div>
    </div>
  )
}
