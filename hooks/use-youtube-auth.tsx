// // hooks/useYoutubeUpload.ts
// import { useState } from 'react'
// import axios from 'axios'

// interface UseYoutubeUploadProps {
//   videoUrl: string
// }

// export function useYoutubeUpload({ videoUrl }: UseYoutubeUploadProps) {
//   const [isPublishing, setIsPublishing] = useState(false)
//   const [isPublished, setIsPublished] = useState(false)
//   const [publishedUrl, setPublishedUrl] = useState<string>('')
//   const [error, setError] = useState<string>('')

//   // Hàm upload video lên YouTube thông qua tài khoản admin (của bạn)
//   const publishToYoutube = async (metadata: {
//     title: string
//     description: string
//     tags: string
//   }) => {
//     if (!videoUrl) {
//       setError('Không có URL video để upload')
//       return
//     }

//     setIsPublishing(true)
//     setError('')

//     try {
//       const response = await axios.post('/api/youtube/upload', {
//         videoUrl,
//         title: metadata.title,
//         description: metadata.description,
//         tags: metadata.tags
//       })

//       if (response.data.success) {
//         setIsPublished(true)
//         setPublishedUrl(response.data.videoUrl)
//       } else {
//         setError(response.data.error || 'Lỗi không xác định khi upload video')
//       }
//     } catch (err: any) {
//       console.error('Lỗi khi upload video:', err)
//       if (err.response?.status === 401) {
//         setError(
//           'Admin chưa xác thực với YouTube API. Vui lòng liên hệ quản trị viên.'
//         )
//       } else {
//         setError(err.response?.data?.error || 'Lỗi khi kết nối đến server')
//       }
//     } finally {
//       setIsPublishing(false)
//     }
//   }

//   return {
//     isPublishing,
//     isPublished,
//     publishedUrl,
//     error,
//     publishToYoutube
//   }
// }
