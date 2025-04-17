// hooks/useShotstackRender.ts
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Effect, MediaItem } from '@/app/utils/type'

interface ShotstackRenderOptions {
  apiKey?: string
  apiUrl?: string
  pollInterval?: number // milliseconds
}

export default function useShotstackRender(
  mediaItems: MediaItem[],
  effect: Effect,
  options: ShotstackRenderOptions = {}
) {
  const [isRendering, setIsRendering] = useState(false)
  const [renderData, setRenderData] = useState<any>(null)
  const [renderStatus, setRenderStatus] = useState<string | null>(null)
  const [renderProgress, setRenderProgress] = useState<number>(0)
  const [renderError, setRenderError] = useState<Error | null>(null)
  const [renderId, setRenderId] = useState<string | null>(null)

  const apiKey =
    options.apiKey || process.env.NEXT_PUBLIC_SHOTSTACK_API_KEY_SANDBOX || ''
  const apiUrl =
    options.apiUrl ||
    process.env.NEXT_PUBLIC_SHOTSTACK_API_URL_SANDBOX ||
    'https://api.shotstack.io/stage'
  const pollInterval = options.pollInterval || 5000

  const createTimeline = (items: MediaItem[]) => {
    const tracks = [
      {
        clips: items.map(item => ({
          asset: {
            type: 'image',
            src: item.image,
            transition: {
              in: item.transitionIn,
              out: item.transitionOut
            }
          },
          start: 0,
          length: item.duration
        }))
      },
      {
        clips: items.map(item => ({
          asset: {
            type: 'audio',
            src: item.audio
          },
          start: 0,
          length: item.duration
        }))
      },
      {
        clips: items.map(item => ({
          asset: {
            type: 'title',
            text: item.title,
            style: 'minimal'
          },
          start: 0,
          length: item.duration,
          position: 'bottom'
        }))
      }
    ]

    let currentTime = 0
    for (let i = 0; i < items.length; i++) {
      tracks.forEach(track => {
        track.clips[i].start = currentTime
      })
      currentTime += items[i].duration
    }

    return {
      timeline: {
        tracks
      },
      output: {
        format: 'mp4',
        resolution: 'hd'
      }
    }
  }

  // Hàm gửi yêu cầu render
  const startRender = async () => {
    if (!mediaItems.length || isRendering) return

    try {
      setIsRendering(true)
      setRenderError(null)
      setRenderData(null)
      setRenderStatus('submitting')
      setRenderProgress(0)

      const requestBody = createTimeline(mediaItems)
      const response = await axios.post(`${apiUrl}/render`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      })

      if (response.data && response.data.success) {
        setRenderId(response.data.response.id)
        setRenderStatus('queued')
        setRenderProgress(10)
      } else {
        throw new Error('Không thể bắt đầu render: Phản hồi không thành công')
      }
    } catch (error) {
      setRenderError(
        error instanceof Error
          ? error
          : new Error('Lỗi không xác định khi render video')
      )
      setIsRendering(false)
    }
  }

  // Hàm kiểm tra trạng thái render
  const checkRenderStatus = async (id: string) => {
    try {
      const response = await axios.get(`${apiUrl}/render/${id}`, {
        headers: {
          'x-api-key': apiKey
        }
      })

      const data = response.data

      if (data && data.success) {
        const status = data.response.status
        setRenderStatus(status)

        // Cập nhật tiến trình dựa trên trạng thái
        switch (status) {
          case 'queued':
            setRenderProgress(10)
            break
          case 'fetching':
            setRenderProgress(20)
            break
          case 'rendering':
            setRenderProgress(40)
            break
          case 'saving':
            setRenderProgress(80)
            break
          case 'done':
            setRenderProgress(100)
            setRenderData(data.response)
            setIsRendering(false)
            break
          case 'failed':
            throw new Error(
              'Render thất bại: ' +
                (data.response.error || 'Không có thông tin lỗi')
            )
        }
      } else {
        throw new Error(
          'Không nhận được phản hồi hợp lệ khi kiểm tra trạng thái'
        )
      }
    } catch (error) {
      setRenderError(
        error instanceof Error
          ? error
          : new Error('Lỗi khi kiểm tra trạng thái render')
      )
      setIsRendering(false)
    }
  }

  // Theo dõi và kiểm tra trạng thái render
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (renderId && isRendering) {
      // Kiểm tra ngay lập tức, sau đó định kỳ
      checkRenderStatus(renderId)

      interval = setInterval(() => {
        checkRenderStatus(renderId)
      }, pollInterval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [renderId, isRendering])

  // Reset state khi mediaItems thay đổi
  useEffect(() => {
    setRenderId(null)
    setRenderData(null)
    setRenderStatus(null)
    setRenderProgress(0)
    setRenderError(null)
    setIsRendering(false)
  }, [mediaItems])

  return {
    startRender,
    isRendering,
    renderData,
    renderStatus,
    renderProgress,
    renderError,
    renderId
  }
}
