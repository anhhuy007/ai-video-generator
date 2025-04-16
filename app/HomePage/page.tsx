// app/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className='container mx-auto px-4 py-16'>
      <h1 className='mb-8 text-center text-4xl font-bold'>
        Ứng dụng Quản lý Video
      </h1>

      <div className='flex flex-col justify-center gap-6 sm:flex-row'>
        <Link
          href='/create-video'
          className='rounded bg-blue-500 px-6 py-4 text-center font-bold text-white hover:bg-blue-700'
        >
          Tạo Video Mới
        </Link>

        <Link
          href='/history'
          className='rounded bg-green-500 px-6 py-4 text-center font-bold text-white hover:bg-green-700'
        >
          Xem Lịch Sử Video
        </Link>

        <Link
          href='/uploadVideo'
          className='rounded bg-purple-500 px-6 py-4 text-center font-bold text-white hover:bg-purple-700'
        >
          Upload Video
        </Link>
      </div>
    </div>
  )
}
