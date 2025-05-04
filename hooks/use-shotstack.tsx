// hooks/useShotstackRender.ts
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Effect, MediaItem } from '@/app/utils/type'

interface ShotstackRenderOptions {
  apiKey?: string
  apiUrl?: string
  pollInterval?: number // milliseconds
}

const MUSIC_STYLES = [
  {
    key: 'Upbeat',
    value: 'upbeat',
    mp3_url:
      'https://res.cloudinary.com/dprxfw51q/video/upload/v1744903851/video_gen_ai/v1y5pg3wdjstf5vhgw7x.mp4'
  },
  {
    key: 'Relaxing',
    value: 'relaxing',
    mp3_url:
      'https://res.cloudinary.com/dprxfw51q/video/upload/v1744904125/video_gen_ai/kxcrij8plog8sypg2scu.mp4'
  },
  {
    key: 'Dramatic',
    value: 'dramatic',
    mp3_url:
      'https://res.cloudinary.com/dprxfw51q/video/upload/v1744904130/video_gen_ai/yup62s3kjrvn8c5umnoi.mp4'
  },
  {
    key: 'Corporate',
    value: 'corporate',
    mp3_url:
      'https://res.cloudinary.com/dprxfw51q/video/upload/v1744904312/video_gen_ai/zjgb91wkqeqnqtpcyuqq.mp4'
  }
]

export default function useShotstackRender(
  mediaItems: MediaItem[],
  effect: Effect,
  isProduction: Boolean
) {
  const [isRendering, setIsRendering] = useState(false)
  const [renderData, setRenderData] = useState<any>(null)
  const [renderStatus, setRenderStatus] = useState<string | null>(null)
  const [renderProgress, setRenderProgress] = useState<number>(0)
  const [renderError, setRenderError] = useState<Error | null>(null)
  const [renderId, setRenderId] = useState<string | null>(null)

  const apiKey = isProduction
    ? process.env.NEXT_PUBLIC_SHOTSTACK_API_KEY_PRODUCTION
    : process.env.NEXT_PUBLIC_SHOTSTACK_API_KEY_SANDBOX

  const apiUrl = isProduction
    ? process.env.NEXT_PUBLIC_SHOTSTACK_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_SHOTSTACK_API_URL_SANDBOX

  const pollInterval = 5000

  const createTimeline = (items: MediaItem[], effect: Effect) => {
    const tracks = [
      {
        clips: items.map((item, index) => {
          const clip = {
            asset: {
              type: 'image',
              src: item.image
            },
            start: 0,
            length: item.duration
          }

          if (item.transitionIn !== 'none' || item.transitionOut !== 'none') {
            const transition: any = {}
            if (item.transitionIn !== 'none') transition.in = item.transitionIn
            if (item.transitionOut !== 'none')
              transition.out = item.transitionOut

            Object.assign(clip, { transition })
          }

          return clip
        })
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
        // Track caption
        clips: items.map(item => ({
          asset: {
            type: 'title',
            text: item.title,
            style: effect.subtitleStyle
          },
          start: 0,
          length: item.duration,
          position: effect.subtitlePosition
        }))
      }
    ]

    // Thêm track nhạc nền từ effect.musicStyle

    tracks.push({
      clips: [
        {
          asset: {
            type: 'audio',
            src: effect.musicStyle.mp3Url,
            volume: 0.3 * (effect.musicStyle.volume / 100)
          } as any,
          start: 0,
          length: items.reduce((total, item) => total + item.duration, 0)
        }
      ]
    })

    let currentTime = 0
    for (let i = 0; i < items.length; i++) {
      for (let t = 0; t < Math.min(tracks.length, 3); t++) {
        tracks[t].clips[i].start = currentTime
      }
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

  const startRender = async () => {
    if (!mediaItems.length || isRendering) return
    console.log('Render media items: ', mediaItems)
    console.log('Render effect', effect)
    const requestBody = createTimeline(mediaItems, effect)
    console.log('Body', requestBody)

    try {
      setIsRendering(true)
      setRenderError(null)
      setRenderData(null)
      setRenderStatus('submitting')
      setRenderProgress(0)

      const requestBody = createTimeline(mediaItems, effect)
      console.log('Body', requestBody)
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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (renderId && isRendering) {
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
