// hooks/useShotstackRender.ts
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Caption, Effect, MediaItem } from '@/app/utils/type'
import { start } from 'repl'
import {
  SUBTITLE_POSITIONS,
  SUBTITLE_STYLES
} from '@/app/generate/pipeline/video-editor'
import { useGenerationStore } from '@/store/useGenerationStore'

export default function useShotstackRender(
  mediaItems: MediaItem[],
  effect: Effect,
  isProduction: Boolean,
  isAutoSubtitle: Boolean,
  isBackgroundMusic: Boolean
) {
  const [isRendering, setIsRendering] = useState(false)
  const [renderData, setRenderData] = useState<any>(null)
  const [renderStatus, setRenderStatus] = useState<string | null>(null)
  const [renderProgress, setRenderProgress] = useState<number>(0)
  const [renderError, setRenderError] = useState<Error | null>(null)
  const [renderId, setRenderId] = useState<string | null>(null)

  const { story } = useGenerationStore()

  const apiKey = isProduction
    ? process.env.NEXT_PUBLIC_SHOTSTACK_API_KEY_PRODUCTION
    : process.env.NEXT_PUBLIC_SHOTSTACK_API_KEY_SANDBOX

  const apiUrl = isProduction
    ? process.env.NEXT_PUBLIC_SHOTSTACK_API_URL_PRODUCTION
    : process.env.NEXT_PUBLIC_SHOTSTACK_API_URL_SANDBOX

  const pollInterval = 5000
  const normalizeAllCaptions = (items: MediaItem[]): Caption[] => {
    const allCaptions: Caption[] = []
    let globalStartTime = 0
    const offsetPerWord = 0.4

    items.forEach((item, sceneIndex) => {
      const title = story.scenes[sceneIndex].title

      // Count the number of words in the title
      const wordCount = title.trim().split(/\s+/).length
      const sceneOffset = wordCount * offsetPerWord

      let currentTime = globalStartTime

      item.captions.forEach(caption => {
        const startTime = currentTime + sceneOffset

        allCaptions.push({
          text: caption.text,
          start: Math.max(0, startTime),
          length: caption.length
        })

        currentTime += caption.length
      })

      globalStartTime += item.duration
    })

    return allCaptions
  }

  const createSRTContent = (captions: Caption[]): string => {
    let srtContent = ''

    captions.forEach((caption, index) => {
      const startTime = formatSRTTime(caption.start)
      const endTime = formatSRTTime(caption.start + caption.length)

      srtContent += `${index + 1}\n`
      srtContent += `${startTime} --> ${endTime}\n`
      srtContent += `${caption.text}\n\n`
    })

    return srtContent
  }

  function formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const milliseconds = Math.floor((seconds % 1) * 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`
  }

  const uploadSRTFileWithAxios = async (
    items: MediaItem[]
  ): Promise<string> => {
    const normalizedCaptions = normalizeAllCaptions(items)
    const srtContent = createSRTContent(normalizedCaptions)

    const blob = new Blob([srtContent], { type: 'text/plain' })
    const file = new File([blob], 'captions.srt', { type: 'text/plain' })

    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post('/api/upload/srt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (!response || !response.data || !response.data.url) {
      throw new Error('Cannot upload file cap')
    }

    return response.data.url
  }

  const createTimeline = async (items: MediaItem[], effect: Effect) => {
    if (!items || items.length === 0) {
      throw new Error('No media items provided.')
    }

    const totalDuration = items.reduce(
      (total, item) => total + item.duration,
      0
    )

    const imageTrack = {
      clips: items.map((item, index) => {
        const clip: any = {
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
          if (item.transitionOut !== 'none') transition.out = item.transitionOut
          clip.transition = transition
        }

        return clip
      })
    }

    const audioTrack = {
      clips: items.map(item => ({
        asset: {
          type: 'audio',
          src: item.audio
        },
        start: 0,
        length: item.duration
      }))
    }

    let musicTrack = null
    if (isBackgroundMusic) {
      musicTrack = {
        clips: [
          {
            asset: {
              type: 'audio',
              src: effect.musicStyle.mp3Url,
              volume: 0.3 * (effect.musicStyle.volume / 100)
            } as any,
            start: 0,
            length: totalDuration
          }
        ]
      }
    }
    let captionTrack = null

    if (isAutoSubtitle) {
      const selectedSubtitlePosition = effect.subtitlePosition || 'bottomLeft'
      const selectedStyle = effect.subtitleStyle || 'future'

      const selectedPosition =
        SUBTITLE_POSITIONS.find(
          pos => pos.value === selectedSubtitlePosition
        ) || SUBTITLE_POSITIONS[0]

      const subtitleStyle =
        SUBTITLE_STYLES.find(style => style.value === selectedStyle) ||
        SUBTITLE_STYLES[0]

      const isBottom = selectedPosition.position === 'bottom'

      try {
        const captionSrc = await uploadSRTFileWithAxios(items)
        console.log('Caption SRT URL:', captionSrc)

        captionTrack = {
          clips: [
            {
              asset: {
                type: 'caption',
                src: captionSrc,
                width: isBottom ? 1000 : 500,
                font: {
                  ...subtitleStyle.font,
                  size: isBottom ? '40' : subtitleStyle.font.size,
                  lineHeight: isBottom ? 1 : subtitleStyle.font.lineHeight
                },
                alignment: selectedPosition.alignment
              },
              position: selectedPosition.position,
              offset: selectedPosition.offset,
              start: 0,
              length: totalDuration
            }
          ]
        }
      } catch (error) {
        console.error('Error uploading SRT file:', error)
        throw new Error('Failed to upload SRT file')
      }
    }

    let tracks = []
    if (captionTrack && isAutoSubtitle) {
      tracks = [captionTrack, imageTrack, audioTrack]
    } else {
      tracks = [imageTrack, audioTrack]
    }

    if (musicTrack && isBackgroundMusic) {
      tracks.push(musicTrack)
    }

    let currentTime = 0
    for (let i = 0; i < items.length; i++) {
      imageTrack.clips[i].start = currentTime
      audioTrack.clips[i].start = currentTime
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

    try {
      setIsRendering(true)
      setRenderError(null)
      setRenderData(null)
      setRenderStatus('submitting')
      setRenderProgress(0)
      const requestBody = await createTimeline(mediaItems, effect)
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
