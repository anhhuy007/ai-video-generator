'use client'
import { useState } from 'react'

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  const handleUpload = async () => {
    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    } else if (videoUrl) {
      formData.append('videoUrl', videoUrl)
    } else {
      alert('Hãy chọn file hoặc nhập link video!')
      return
    }

    setUploading(true)
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    setUploading(false)

    if (data.url) {
      setUploadedUrl(data.url)
    } else {
      alert('Upload thất bại!')
    }
  }

  return (
    <div>
      <input type='file' accept='video/*' onChange={handleFileChange} />
      <input
        type='text'
        placeholder='Hoặc nhập link video'
        value={videoUrl}
        onChange={e => setVideoUrl(e.target.value)}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Đang tải lên...' : 'Upload'}
      </button>
      {uploadedUrl && (
        <div>
          <h3>Video đã tải lên:</h3>
          <video src={uploadedUrl} controls width='400' />
        </div>
      )}
    </div>
  )
}
