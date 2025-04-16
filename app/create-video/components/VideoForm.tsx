// app/create-video/components/VideoForm.tsx
'use client'
import { useState } from 'react'

export default function VideoForm() {
  const [userId, setUserId] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // Kiểm tra các trường bắt buộc
    if (!userId) {
      setError('Vui lòng nhập User ID')
      return
    }

    if (!prompt) {
      setError('Vui lòng nhập Prompt')
      return
    }

    if (!title) {
      setError('Vui lòng nhập tiêu đề cho video')
      return
    }

    if (!file && !videoUrl) {
      setError('Vui lòng chọn file hoặc nhập đường link video')
      return
    }

    // Bước 1: Upload video lên Cloudinary
    try {
      setUploading(true)
      const formData = new FormData()

      if (file) {
        formData.append('file', file)
      } else if (videoUrl) {
        formData.append('videoUrl', videoUrl)
      }

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const uploadData = await uploadResponse.json()
      setUploading(false)

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Lỗi khi upload video')
      }

      if (!uploadData.url) {
        throw new Error('Không thể lấy được URL video')
      }

      setUploadedUrl(uploadData.url)

      // Bước 2: Tạo gallery entry
      const galleryResponse = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoUrl: uploadData.url,
          title: title,
          addedBy: userId
        })
      })

      const galleryData = await galleryResponse.json()

      if (!galleryResponse.ok) {
        throw new Error(galleryData.error || 'Lỗi khi tạo gallery entry')
      }

      // Bước 3: Tạo gen history entry
      const genHistoryResponse = await fetch('/api/gen_history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          prompt: prompt,
          galleryId: galleryData.galleryEntry.id
        })
      })

      const genHistoryData = await genHistoryResponse.json()

      if (!genHistoryResponse.ok) {
        throw new Error(genHistoryData.error || 'Lỗi khi tạo lịch sử')
      }

      setSuccessMessage('Video đã được tạo thành công!')

      // Reset form sau khi hoàn thành
      setFile(null)
      setVideoUrl('')
      setPrompt('')
      setTitle('')
    } catch (error) {
      console.error('Lỗi:', error)
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi')
      setUploading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md'
    >
      {error && (
        <div className='mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
          {error}
        </div>
      )}

      {successMessage && (
        <div className='mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700'>
          {successMessage}
        </div>
      )}

      <div className='mb-4'>
        <label
          className='mb-2 block text-sm font-bold text-gray-700'
          htmlFor='userId'
        >
          User ID *
        </label>
        <input
          id='userId'
          type='text'
          placeholder='Nhập User ID'
          value={userId}
          onChange={e => setUserId(e.target.value)}
          className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
          required
        />
      </div>

      <div className='mb-4'>
        <label
          className='mb-2 block text-sm font-bold text-gray-700'
          htmlFor='title'
        >
          Tiêu đề video *
        </label>
        <input
          id='title'
          type='text'
          placeholder='Nhập tiêu đề cho video'
          value={title}
          onChange={e => setTitle(e.target.value)}
          className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
          required
        />
      </div>

      <div className='mb-4'>
        <label
          className='mb-2 block text-sm font-bold text-gray-700'
          htmlFor='file'
        >
          Tải lên video
        </label>
        <input
          id='file'
          type='file'
          accept='video/*'
          onChange={handleFileChange}
          className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
        />
      </div>

      <div className='mb-4'>
        <label
          className='mb-2 block text-sm font-bold text-gray-700'
          htmlFor='videoUrl'
        >
          Hoặc nhập đường link video
        </label>
        <input
          id='videoUrl'
          type='text'
          placeholder='Nhập URL video'
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
        />
      </div>

      <div className='mb-6'>
        <label
          className='mb-2 block text-sm font-bold text-gray-700'
          htmlFor='prompt'
        >
          Prompt *
        </label>
        <textarea
          id='prompt'
          placeholder='Nhập prompt cho video'
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className='focus:shadow-outline h-32 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
          required
        />
      </div>

      <div className='flex items-center justify-between'>
        <button
          type='submit'
          disabled={uploading}
          className='focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none'
        >
          {uploading ? 'Đang xử lý...' : 'Tạo video'}
        </button>
      </div>

      {uploadedUrl && (
        <div className='mt-6'>
          <h3 className='mb-2 text-lg font-semibold'>Video đã tải lên:</h3>
          <video src={uploadedUrl} controls width='400' className='rounded' />
        </div>
      )}
    </form>
  )
}
