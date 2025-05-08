'use client'

import { useState, useEffect, useRef, use } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import {
  Check,
  Music,
  Subtitles,
  Video,
  Trash2,
  GripVertical,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useGenerationStore } from '@/store/useGenerationStore'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import useShotstackRender from '@/hooks/use-shotstack'
import { string } from 'zod'
import { MediaItem, Effect } from '@/app/utils/type'
import { error } from 'console'
import axios from 'axios'
import { Caption } from '@/app/utils/type'

// Format time in MM:SS format
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getAudioDuration = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.src = url
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
    })
    audio.addEventListener('error', err => {
      reject(err)
    })
  })
}

const TRANSITION_EFFECTS = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'fadeFast', label: 'Fade Fast' },
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'zoom', label: 'Zoom' }
]

// Subtitle styles
export const SUBTITLE_STYLES = [
  {
    key: 'Future',
    value: 'future',
    font: {
      family: 'Orbitron Bold',
      size: '48',
      lineHeight: 1.2
    }
  },
  {
    key: 'Minimal',
    value: 'minimal',
    font: {
      family: 'Open Sans Regular',
      size: '42',
      lineHeight: 1.4
    }
  },
  {
    key: 'Skinny',
    value: 'skinny',
    font: {
      family: 'Roboto Thin',
      size: '40',
      lineHeight: 1.5
    }
  }
]

export const SUBTITLE_POSITIONS = [
  {
    key: 'Bottom Left',
    value: 'bottomLeft',
    position: 'bottom',
    alignment: { horizontal: 'left' },
    offset: { x: 0.1, y: 0 }
  },
  {
    key: 'Bottom Center',
    value: 'bottom',
    position: 'bottom',
    alignment: { horizontal: 'center' },
    offset: { x: 0, y: 0 }
  },
  {
    key: 'Bottom Right',
    value: 'bottomRight',
    position: 'bottom',
    alignment: { horizontal: 'right' },
    offset: { x: -0.1, y: 0 }
  },
  {
    key: 'Center',
    value: 'center',
    position: 'center',
    alignment: { horizontal: 'center' },
    offset: { x: 0, y: 0 }
  },
  {
    key: 'Left',
    value: 'left',
    position: 'left',
    alignment: { horizontal: 'left' },
    offset: { x: 0.1, y: 0 }
  },
  {
    key: 'Right',
    value: 'right',
    position: 'right',
    alignment: { horizontal: 'right' },
    offset: { x: -0.1, y: 0 }
  }
]

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

export default function VideoEditor({
  onComplete
}: {
  onComplete: () => void
}) {
  const [activeTab, setActiveTab] = useState('timeline')
  const [autoSubtitles, setAutoSubtitles] = useState(true)
  const [backgroundMusic, setBackgroundMusic] = useState(true)
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const { story, images, mp3_url, setVideoUrl } = useGenerationStore()
  const [media_items, setMediaItems] = useState<MediaItem[]>([])
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string>('')
  const [previewVideoError, setPreviewVideoError] = useState<string>('')
  const [isConfigurationComplete, setIsConfigurationComplete] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [effect, setEffect] = useState<Effect>({
    subtitleStyle: 'future',
    subtitlePosition: 'bottom',
    musicStyle: {
      musicStyle: 'upbeat',
      mp3Url:
        'https://res.cloudinary.com/dprxfw51q/video/upload/v1744903851/video_gen_ai/v1y5pg3wdjstf5vhgw7x.mp4',
      volume: 20
    }
  })

  const downloadAndUploadVideo = async () => {
    try {
      if (!previewVideoUrl) return

      const videoResponse = await fetch(previewVideoUrl)
      const videoBlob = await videoResponse.blob()

      const file = new File([videoBlob], 'preview.mp4', { type: 'video/mp4' })
      const formData = new FormData()
      formData.append('file', file)

      // Step 1: Upload video to Cloudinary
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.error || 'Failed to upload video to Cloudinary'
        )
      }

      const uploadedVideoUrl = uploadData.url
      setVideoUrl(uploadedVideoUrl)

      if (!uploadedVideoUrl) {
        throw new Error('Failed to upload video to Cloudinary')
      }

      // Step 2: Create a gallery entry
      const videoDuration = await getAudioDuration(uploadedVideoUrl)
      const durationInt = Math.round(videoDuration)

      const galleryResponse = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoUrl: uploadedVideoUrl,
          title: story.prompt,
          category: null,
          duration: durationInt
        })
      })

      const galleryData = await galleryResponse.json()

      if (!galleryResponse.ok || !galleryData.galleryEntry) {
        throw new Error(
          galleryData.error ||
            `Failed to create gallery entry: ${galleryResponse.status} ${galleryResponse.statusText}`
        )
      }

      console.log('Gallery entry created:', galleryData)
      const galleryEntry = galleryData.galleryEntry

      // Step 3: Create a gen history entry
      const genHistoryResponse = await fetch('/api/gen_history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: story.prompt,
          galleryId: galleryData.galleryEntry.id
        })
      })

      const genHistoryData = await genHistoryResponse.json()

      if (!genHistoryResponse.ok || !genHistoryData) {
        throw new Error(
          genHistoryData.error ||
            `Failed to create gen history entry: ${genHistoryResponse.status} ${genHistoryResponse.statusText}`
        )
      }

      console.log('Gen history entry created:', genHistoryData)
    } catch (error: any) {
      console.error('Upload or API error:', error.message)
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }

  // Update completion status when configuration is complete
  useEffect(() => {
    if (isConfigurationComplete) {
      onComplete()
    }
  }, [isConfigurationComplete, onComplete])

  const updateEffect = (key: keyof Effect, value: string) => {
    setEffect(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const toggleBackgroundMusic = () => {
    console.log('Toggle')

    if (backgroundMusicRef.current) {
      if (isMusicPlaying) {
        backgroundMusicRef.current.pause()
      } else {
        backgroundMusicRef.current.src = effect.musicStyle.mp3Url
        backgroundMusicRef.current.volume = effect.musicStyle.volume / 100
        backgroundMusicRef.current.play()
      }
      setIsMusicPlaying(!isMusicPlaying)
    } else {
      console.log('nothing')
    }
  }

  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const handleMusicStyleChange = (styleValue: string) => {
    const selectedStyle = MUSIC_STYLES.find(style => style.value === styleValue)
    if (selectedStyle) {
      setEffect(prev => ({
        ...prev,
        musicStyle: {
          ...prev.musicStyle,
          musicStyle: styleValue,
          mp3Url: selectedStyle.mp3_url
        }
      }))

      if (isMusicPlaying && backgroundMusicRef.current) {
        backgroundMusicRef.current.src = selectedStyle.mp3_url
        backgroundMusicRef.current.play()
      }
    }
  }

  const handleMusicVolumeChange = (value: number[]) => {
    setEffect(prev => ({
      ...prev,
      musicStyle: {
        ...prev.musicStyle,
        volume: value[0]
      }
    }))

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = value[0] / 100
    }
  }

  // Render
  const { startRender, isRendering, renderData } = useShotstackRender(
    media_items,
    effect,
    false,
    autoSubtitles,
    backgroundMusic
  )

  useEffect(() => {
    if (renderData == null) return
    setIsPreviewReady(true)

    if (renderData.error !== '') {
      setPreviewVideoError(renderData.error)
      return
    }
    setPreviewVideoUrl(renderData.url)
  }, [renderData])

  function splitCaption(
    text: string,
    sceneDuration: number,
    maxWordsPerLine: number = 9
  ): Caption[] {
    const words = text.split(' ')
    const chunks: string[] = []

    for (let i = 0; i < words.length; i += maxWordsPerLine) {
      const chunk = words.slice(i, i + maxWordsPerLine).join(' ')
      chunks.push(chunk)
    }

    const chunkDuration = sceneDuration / chunks.length
    const captions: Caption[] = chunks.map((chunk, i) => ({
      text: chunk,
      start: i * chunkDuration,
      length: chunkDuration
    }))

    return captions
  }

  useEffect(() => {
    const loadMediaItems = async () => {
      const audioDurations = await Promise.all(
        mp3_url.map(url => getAudioDuration(url))
      )
      try {
        const items: MediaItem[] = images.map((image, index) => {
          const scene = story.scenes[index]
          const narration = scene.narration
          const duration = audioDurations[index] || 2
          const captions = splitCaption(narration, duration)
          return {
            id: `item-${index + 1}`,
            title: scene ? scene.title : `Untitled Scene ${index + 1}`,
            image: image,
            audio: mp3_url[index],
            duration: audioDurations[index] || 2,
            transitionIn: 'none',
            transitionOut: 'none',
            captions: captions
          }
        })
        setMediaItems(items)
      } catch (error) {
        console.error('Failed to load media items:', error)
      }
    }
    loadMediaItems()
  }, [images, mp3_url, story])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Update completion status when editor is complete
  useEffect(() => {
    if (isConfigurationComplete) {
      onComplete()
    }
  }, [isConfigurationComplete, onComplete])

  const handleComplete = async () => {
    setIsUploading(true)

    try {
      await downloadAndUploadVideo()
      setIsConfigurationComplete(true)
    } catch (error) {
      console.error('Error during video processing:', error)
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (!backgroundMusic) return

    const selectedMusic = MUSIC_STYLES.find(
      style => style.value === effect.musicStyle.musicStyle
    )

    if (!selectedMusic) return

    if (selectedMusic.mp3_url !== effect.musicStyle.mp3Url) {
      setEffect(prev => ({
        ...prev,
        musicStyle: {
          ...prev.musicStyle,
          mp3Url: selectedMusic.mp3_url
        }
      }))
    }
  }, [backgroundMusic, effect.musicStyle.musicStyle])
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    setMediaItems(prev => {
      const newItems = [...prev]
      const [movedItem] = newItems.splice(source.index, 1)
      newItems.splice(destination.index, 0, movedItem)
      return newItems
    })
  }

  // Handle audio playback
  const handlePlayAudio = (itemId: string, audioSrc: string) => {
    if (currentlyPlaying === itemId) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(null)
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.src = audioSrc
        audioRef.current.play()
      }
      setCurrentlyPlaying(itemId)
    }
  }

  // Handle audio ended
  const handleAudioEnded = () => {
    setCurrentlyPlaying(null)
  }

  // Update transition effect
  const updateTransitionEffect = (
    itemId: string,
    type: 'in' | 'out',
    effect: string
  ) => {
    setMediaItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              transitionIn: type === 'in' ? effect : item.transitionIn,
              transitionOut: type === 'out' ? effect : item.transitionOut
            }
          : item
      )
    )
  }

  return (
    <div>
      <h2 className='mb-4 text-2xl font-bold'>Advanced Video Editor</h2>
      <p className='mb-6 text-muted-foreground'>
        Arrange your images and audio, add transitions, and customize your video
        before publishing.
      </p>
      {/* Add a hidden audio element for background music */}
      <audio ref={backgroundMusicRef} loop className='hidden' />
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} onEnded={handleAudioEnded} className='hidden' />

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-3'>
          <TabsTrigger value='timeline'>Timeline</TabsTrigger>
          <TabsTrigger value='effects'>Effects & Audio</TabsTrigger>
          <TabsTrigger value='preview'>Preview</TabsTrigger>
        </TabsList>

        <TabsContent value='timeline'>
          <div className='space-y-6'>
            {/* Available Media Items Panel */}
            <Card>
              <CardContent className='p-10'>
                <Label className='mb-4 block text-base font-medium'>
                  Media Items
                </Label>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable
                    droppableId='available-items'
                    direction='horizontal'
                  >
                    {provided => (
                      <div
                        className='flex gap-3 overflow-x-auto pb-4'
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {media_items.length === 0 ? (
                          <div className='w-full py-8 text-center text-muted-foreground'>
                            <p>All items have been added to the timeline</p>
                          </div>
                        ) : (
                          media_items.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {provided => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className='w-[300px] flex-shrink-0 overflow-hidden rounded-md border bg-card transition-shadow hover:shadow-md'
                                >
                                  <div className='flex items-center justify-between bg-muted/30 p-2'>
                                    <div className='flex items-center'>
                                      <GripVertical className='mr-2 h-4 w-4 text-muted-foreground' />
                                      <span className='truncate text-sm font-medium'>
                                        {item.title}
                                      </span>
                                    </div>
                                    <div className='flex items-center space-x-1'>
                                      <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-7 w-7'
                                        onClick={() =>
                                          handlePlayAudio(item.id, item.audio)
                                        }
                                      >
                                        {currentlyPlaying === item.id ? (
                                          <Pause className='h-3 w-3' />
                                        ) : (
                                          <Play className='h-3 w-3' />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className='relative'>
                                    <img
                                      src={item.image || '/placeholder.svg'}
                                      alt={item.title}
                                      className='h-auto w-full'
                                    />
                                    <div className='absolute bottom-0 right-0 rounded-tl-md bg-black/70 px-2 py-1 text-xs text-white'>
                                      {Math.floor(item.duration / 60)}:
                                      {(item.duration % 60)
                                        .toString()
                                        .padStart(2, '0')}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>

            <Button onClick={() => setActiveTab('effects')} className='w-full'>
              Continue to Effects & Audio
            </Button>
          </div>
        </TabsContent>

        <TabsContent value='effects'>
          <div className='space-y-6'>
            <div>
              <Label className='mb-2 block text-lg font-medium'>
                Scene Transitions
              </Label>
              <p className='mb-4 text-sm text-muted-foreground'>
                Select transition effects for each scene in your video
              </p>

              <div className='grid grid-cols-1 gap-4'>
                {media_items.map((item, index) => (
                  <Card key={item.id} className='overflow-hidden'>
                    <CardContent className='p-4'>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='flex items-center space-x-3'>
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.title}
                            className='h-16 w-16 rounded-md object-cover'
                          />
                          <div>
                            <div className='font-medium'>{item.title}</div>
                            <div className='text-xs text-muted-foreground'>
                              {index === 0
                                ? 'First Scene'
                                : `Scene ${index + 1}`}{' '}
                              • {formatTime(item.duration)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className='mb-2 block'>Transition In</Label>
                          <Select
                            value={item.transitionIn || 'none'}
                            onValueChange={value =>
                              updateTransitionEffect(item.id, 'in', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select transition in effect' />
                            </SelectTrigger>
                            <SelectContent>
                              {TRANSITION_EFFECTS.map(effect => (
                                <SelectItem
                                  key={`in-${effect.value}`}
                                  value={effect.value}
                                >
                                  {effect.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className='mt-2 text-xs text-muted-foreground'>
                            Effect when this scene appears
                          </div>
                        </div>

                        <div>
                          <Label className='mb-2 block'>Transition Out</Label>
                          <Select
                            value={item.transitionOut || 'none'}
                            onValueChange={value =>
                              updateTransitionEffect(item.id, 'out', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select transition out effect' />
                            </SelectTrigger>
                            <SelectContent>
                              {TRANSITION_EFFECTS.map(effect => (
                                <SelectItem
                                  key={`out-${effect.value}`}
                                  value={effect.value}
                                >
                                  {effect.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className='mt-2 text-xs text-muted-foreground'>
                            Effect when transitioning to the next scene
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <Label className='mb-2 block'>Subtitles</Label>
                <Card>
                  <CardContent className='p-4'>
                    <div className='mb-4 flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <Subtitles className='h-4 w-4 text-muted-foreground' />
                        <span>Auto-generate subtitles</span>
                      </div>
                      <Switch
                        checked={autoSubtitles}
                        onCheckedChange={setAutoSubtitles}
                      />
                    </div>

                    {autoSubtitles && (
                      <div className='space-y-2'>
                        <div>
                          <Label className='text-xs'>Subtitle Style</Label>
                          <div className='mt-1 grid grid-cols-3 gap-2'>
                            {SUBTITLE_STYLES.map(style => (
                              <div
                                key={style.value}
                                style={{ fontFamily: style.font.family }}
                                className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                                  effect.subtitleStyle === style.value
                                    ? 'border-primary bg-primary/10'
                                    : 'hover:bg-muted/50'
                                }`}
                                onClick={() =>
                                  updateEffect('subtitleStyle', style.value)
                                }
                              >
                                {style.key}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className='text-xs'>Position</Label>
                          <div className='mt-1 grid grid-cols-3 gap-2'>
                            {SUBTITLE_POSITIONS.map(position => (
                              <div
                                key={position.value}
                                className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                                  effect.subtitlePosition === position.value
                                    ? 'border-primary bg-primary/10'
                                    : 'hover:bg-muted/50'
                                }`}
                                onClick={() =>
                                  updateEffect(
                                    'subtitlePosition',
                                    position.value
                                  )
                                }
                              >
                                {position.key}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label className='mb-2 block'>Background Music</Label>
                <Card>
                  <CardContent className='p-4'>
                    <div className='mb-4 flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <Music className='h-4 w-4 text-muted-foreground' />
                        <span>Add background music</span>
                      </div>
                      <Switch
                        checked={backgroundMusic}
                        onCheckedChange={setBackgroundMusic}
                      />
                    </div>

                    {backgroundMusic && (
                      <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-2'>
                          {MUSIC_STYLES.map(style => (
                            <div
                              key={style.value}
                              className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                                effect.musicStyle.musicStyle === style.value
                                  ? 'border-primary bg-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() =>
                                handleMusicStyleChange(style.value)
                              }
                            >
                              {style.key}
                            </div>
                          ))}
                        </div>

                        <div className='mb-2 flex items-center justify-between'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={toggleBackgroundMusic}
                            className='flex items-center space-x-2'
                          >
                            {isMusicPlaying ? (
                              <>
                                <Pause className='h-4 w-4' />
                                <span>Pause</span>
                                <span className='ml-2 flex space-x-1'>
                                  <span
                                    className={`inline-block h-3 w-1 animate-pulse rounded-full bg-primary`}
                                    style={{ animationDelay: '0ms' }}
                                  ></span>
                                  <span
                                    className={`inline-block h-4 w-1 animate-pulse rounded-full bg-primary`}
                                    style={{ animationDelay: '150ms' }}
                                  ></span>
                                  <span
                                    className={`inline-block h-2 w-1 animate-pulse rounded-full bg-primary`}
                                    style={{ animationDelay: '300ms' }}
                                  ></span>
                                  <span
                                    className={`inline-block h-5 w-1 animate-pulse rounded-full bg-primary`}
                                    style={{ animationDelay: '450ms' }}
                                  ></span>
                                </span>
                              </>
                            ) : (
                              <>
                                <Play className='h-4 w-4' />
                                <span>Play</span>
                              </>
                            )}
                          </Button>
                          <span className='text-xs text-muted-foreground'>
                            {effect.musicStyle.musicStyle}
                          </span>
                        </div>

                        <div>
                          <div className='mb-1 flex justify-between'>
                            <Label className='text-xs'>Volume</Label>
                            <span className='text-xs text-muted-foreground'>
                              {effect.musicStyle.volume}%
                            </span>
                          </div>
                          <Slider
                            value={[effect.musicStyle.volume]}
                            onValueChange={handleMusicVolumeChange}
                            min={0}
                            max={100}
                            step={5}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* 
            <div>
              <Label className='mb-2 block'>Animations & Effects</Label>
              <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
                {[
                  'Fade In/Out',
                  'Text Animation',
                  'Zoom Effect',
                  'Color Grading',
                  'Blur Background',
                  'Picture-in-Picture',
                  'Split Screen',
                  'Slow Motion'
                ].map((effect, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-md border p-2 text-center text-sm ${
                      selectedEffects.includes(effect)
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleEffect(effect)}
                  >
                    {effect}
                  </div>
                ))}
              </div>
            </div> */}

            <div className='flex justify-between'>
              <Button
                variant='outline'
                onClick={() => setActiveTab('timeline')}
              >
                Back to Timeline
              </Button>
              <Button onClick={() => setActiveTab('preview')}>
                Continue to Preview
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='preview'>
          <div className='space-y-6'>
            <div className='overflow-hidden rounded-md border'>
              <div className='flex aspect-video items-center justify-center bg-muted'>
                {previewVideoUrl && !previewVideoError ? (
                  <video
                    className='h-full w-full object-contain'
                    controls
                    src={previewVideoUrl}
                    onError={() =>
                      setPreviewVideoError('Failed to load video.')
                    }
                  />
                ) : previewVideoError ? (
                  <div className='px-4 text-center'>
                    <Video className='mx-auto h-12 w-12 text-red-500' />
                    <p className='mt-2 text-sm text-red-600'>
                      {previewVideoError}
                    </p>
                  </div>
                ) : (
                  <div className='text-center'>
                    <Video className='mx-auto h-12 w-12 text-muted-foreground' />
                    <p className='mt-2 text-muted-foreground'>Video Preview</p>
                    <Button
                      variant='outline'
                      size='sm'
                      className='mt-4 flex items-center gap-2'
                      onClick={startRender}
                      disabled={isRendering}
                    >
                      {isRendering ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Generating Video...
                        </>
                      ) : (
                        'Generate Video'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className='flex justify-between'>
              <Button variant='outline' onClick={() => setActiveTab('effects')}>
                Back to Effects
              </Button>
              <Button
                onClick={handleComplete}
                disabled={
                  !isPreviewReady || isUploading || isConfigurationComplete
                }
              >
                {isUploading ? (
                  <span className='flex items-center'>
                    <span className='mr-2 animate-spin'>◯</span>
                    Uploading...
                  </span>
                ) : isConfigurationComplete ? (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    Successfully finalize and upload to Cloudinary
                  </>
                ) : (
                  'Finalize Video and upload to Cloudinary'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
