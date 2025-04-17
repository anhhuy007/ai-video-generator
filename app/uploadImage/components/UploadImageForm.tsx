'use client'
import { useState } from 'react'
// app/uploadImage/components/UploadImageForm.tsx
export default function UploadImageForm() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [base64Image, setBase64Image] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [preview, setPreview] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null

    // Clear previous data
    setFile(selectedFile)
    setImageUrl('')
    setError('')
    setUploadedUrl('')

    if (selectedFile) {
      setFileName(selectedFile.name)

      // Create image preview
      const reader = new FileReader()
      reader.onload = event => {
        if (event.target?.result) {
          setPreview(event.target.result as string)
          setBase64Image(event.target.result as string)
        }
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview('')
      setBase64Image('')
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    setFile(null)
    setFileName('')
    setBase64Image('')
    setPreview('')
    setError('')
    setUploadedUrl('')
  }

  const validateImageUrl = (url: string) => {
    if (!url) return false
    return (
      url.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i) !== null ||
      url.startsWith('http') ||
      url.startsWith('https')
    )
  }

  const handleUpload = async () => {
    setError('')

    if (file && base64Image) {
      // Upload using base64 method
      setUploading(true)
      try {
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ base64Image })
        })

        const data = await response.json()

        if (data.url) {
          setUploadedUrl(data.url)
        } else {
          setError('Upload thất bại: ' + (data.error || 'Lỗi không xác định'))
        }
      } catch (error) {
        setError('Có lỗi xảy ra khi tải lên')
        console.error(error)
      } finally {
        setUploading(false)
      }
    } else if (imageUrl) {
      if (!validateImageUrl(imageUrl)) {
        setError('URL không hợp lệ hoặc không phải là URL hình ảnh')
        return
      }

      // Upload using URL
      setUploading(true)
      try {
        const response = await fetch('/api/upload/image/url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageUrl })
        })

        const data = await response.json()

        if (data.url) {
          setUploadedUrl(data.url)
        } else {
          setError('Upload thất bại: ' + (data.error || 'Lỗi không xác định'))
        }
      } catch (error) {
        setError('Có lỗi xảy ra khi tải lên')
        console.error(error)
      } finally {
        setUploading(false)
      }
    } else {
      setError('Hãy chọn file hoặc nhập link hình ảnh!')
    }
  }

  const handlePreviewError = () => {
    setPreview('')
    setError('Không thể hiển thị hình ảnh từ URL này')
  }

  return (
    <div className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-md'>
      <div className='mb-4'>
        <label className='mb-2 block text-gray-700'>Chọn hình ảnh</label>
        <input
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          className='w-full rounded border border-gray-300 p-2'
        />
        {fileName && (
          <p className='mt-1 text-sm text-gray-500'>Đã chọn: {fileName}</p>
        )}
      </div>

      <div className='mb-4'>
        <div className='my-4 flex items-center'>
          <div className='flex-grow border-t border-gray-300'></div>
          <span className='mx-4 text-gray-500'>HOẶC</span>
          <div className='flex-grow border-t border-gray-300'></div>
        </div>

        <label className='mb-2 block text-gray-700'>Nhập link hình ảnh</label>
        <input
          type='text'
          placeholder='Nhập URL hình ảnh'
          value={imageUrl}
          onChange={handleUrlChange}
          className='w-full rounded border border-gray-300 p-2'
        />
        {imageUrl && validateImageUrl(imageUrl) && (
          <button
            onClick={() => setPreview(imageUrl)}
            className='mt-2 text-sm text-blue-500 hover:text-blue-700'
          >
            Xem trước hình ảnh
          </button>
        )}
      </div>

      {preview && (
        <div className='mb-4'>
          <p className='mb-2 text-sm text-gray-700'>Xem trước:</p>
          <img
            src={preview}
            alt='Preview'
            className='h-auto max-h-64 w-full rounded border object-contain'
            onError={handlePreviewError}
          />
        </div>
      )}

      {error && (
        <div className='mb-4 rounded border border-red-400 bg-red-100 p-2 text-red-700'>
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className='w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300'
      >
        {uploading ? 'Đang tải lên...' : 'Upload'}
      </button>

      {uploadedUrl && (
        <div className='mt-6'>
          <h3 className='mb-2 text-lg font-semibold'>Hình ảnh đã tải lên:</h3>
          <img
            src={uploadedUrl}
            alt='Uploaded'
            className='h-auto max-h-64 w-full rounded border object-contain'
          />
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
