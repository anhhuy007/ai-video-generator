// app/create-video/page.tsx
import VideoForm from './components/VideoForm'

export default function CreateVideoPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Tạo Video Mới</h1>
      <VideoForm />
    </div>
  )
}
