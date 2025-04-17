'use client'
import { useState } from 'react'
// app/uploadAudio/components/UploadAudioForm.tsx
export default function UploadAudioForm() {
  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    if (selectedFile) {
      setFileName(selectedFile.name)
    }
  }

  const handleUpload = async () => {
    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    } else if (audioUrl) {
      formData.append('audioUrl', audioUrl)
    } else {
      alert('Hãy chọn file hoặc nhập link âm thanh!')
      return
    }

    setUploading(true)
    try {
      const response = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.url) {
        setUploadedUrl(data.url)
      } else {
        alert('Upload thất bại: ' + (data.error || 'Lỗi không xác định'))
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi tải lên')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-md'>
      <div className='mb-4'>
        <label className='mb-2 block text-gray-700'>Chọn file MP3</label>
        <input
          type='file'
          accept='audio/mp3,audio/*'
          onChange={handleFileChange}
          className='w-full rounded border border-gray-300 p-2'
        />
        {fileName && (
          <p className='mt-1 text-sm text-gray-500'>Đã chọn: {fileName}</p>
        )}
      </div>

      <div className='mb-4'>
        <label className='mb-2 block text-gray-700'>
          Hoặc nhập link âm thanh
        </label>
        <input
          type='text'
          placeholder='Nhập URL âm thanh'
          value={audioUrl}
          onChange={e => setAudioUrl(e.target.value)}
          className='w-full rounded border border-gray-300 p-2'
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className='w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300'
      >
        {uploading ? 'Đang tải lên...' : 'Upload'}
      </button>

      {uploadedUrl && (
        <div className='mt-6'>
          <h3 className='mb-2 text-lg font-semibold'>Âm thanh đã tải lên:</h3>
          <audio src={uploadedUrl} controls className='mt-2 w-full' />
          <p className='mt-2 break-all text-sm text-blue-600'>
            <a href={uploadedUrl} target='_blank' rel='noopener noreferrer'>
              {uploadedUrl}
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
