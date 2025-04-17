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

// Mock data for images and audio files
interface MediaItem {
  id: string
  title: string
  image: string
  audio: string
  duration: number
  transitionIn: string
  transitionOut: string
}

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
  { value: 'slideLeft', label: 'Slide Left' },
  { value: 'slideRight', label: 'Slide Right' },
  { value: 'slideUp', label: 'Slide Up' },
  { value: 'slideDown', label: 'Slide Down' },
  { value: 'circleOpen', label: 'Circle Open' },
  { value: 'circleClose', label: 'Circle Close' },
  { value: 'wipeLeft', label: 'Wipe Left' },
  { value: 'wipeRight', label: 'Wipe Right' },
  { value: 'wipeUp', label: 'Wipe Up' },
  { value: 'wipeDown', label: 'Wipe Down' },
  { value: 'reveal', label: 'Reveal' }
]

// Transition options

export default function VideoEditor({
  onComplete
}: {
  onComplete: () => void
}) {
  const [activeTab, setActiveTab] = useState('timeline')
  const [autoSubtitles, setAutoSubtitles] = useState(true)
  const [backgroundMusic, setBackgroundMusic] = useState(true)
  const [musicVolume, setMusicVolume] = useState([70])
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const [isEditorComplete, setIsEditorComplete] = useState(false)
  const { story, images, mp3_url } = useGenerationStore()
  const [media_items, setMediaItems] = useState<MediaItem[]>([])

  // Effect and audio settings
  const [subtitleStyle, setSubtitleStyle] = useState('standard')
  const [subtitlePosition, setSubtitlePosition] = useState('bottom')
  const [musicStyle, setMusicStyle] = useState('upbeat')
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])

  // Render
  const { startRender, isRendering, renderData } = useShotstackRender(
    media_items,
    {
      apiKey: process.env.NEXT_PUBLIC_SHOTSTACK_API_KEY_SANDBOX,
      apiUrl: process.env.NEXT_PUBLIC_SHOTSTACK_API_URL_SANDBOX
    }
  )

  useEffect(() => {
    if (renderData) {
      console.log('Video đã render xong:', renderData)
    }
  }, [renderData])

  const toggleEffect = (effect: string) => {
    setSelectedEffects(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    )
  }

  useEffect(() => {
    const loadMediaItems = async () => {
      console.log('Loading media items...', images)
      const audioDurations = await Promise.all(
        mp3_url.map(url => getAudioDuration(url))
      )
      try {
        const items: MediaItem[] = images.map((image, index) => {
          const scene = story.scenes[index]
          return {
            id: `item-${index + 1}`,
            title: scene ? scene.title : `Untitled Scene ${index + 1}`,
            image: image,
            audio: mp3_url[index],
            duration: audioDurations[index] || 2,
            transitionIn: 'none',
            transitionOut: 'none'
          }
        })
        setMediaItems(items)
      } catch (error) {
        console.error('Failed to load media items:', error)
      }
    }
    loadMediaItems()
  }, [images, mp3_url, story])

  useEffect(() => {
    console.log('Media items:', media_items)
  }, [media_items])

  // Timeline items state
  // const [timelineItems, setTimelineItems] = useState<any[]>([])
  // const [transitions, setTransitions] = useState<{ [key: string]: string }>({})
  // Audio playback state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Calculate total duration
  const totalDuration = 10

  // Update completion status when editor is complete
  useEffect(() => {
    if (isEditorComplete) {
      onComplete()
    }
  }, [isEditorComplete, onComplete])

  const handleComplete = () => {
    setIsEditorComplete(true)
  }

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
                              updateTransitionEffect(item.id, 'in', value)
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
                            <div
                              className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                                subtitleStyle === 'standard'
                                  ? 'border-primary bg-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setSubtitleStyle('standard')}
                            >
                              Standard
                            </div>
                            <div
                              className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                                subtitleStyle === 'minimal'
                                  ? 'border-primary bg-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setSubtitleStyle('minimal')}
                            >
                              Minimal
                            </div>
                            <div
                              className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                                subtitleStyle === 'bold'
                                  ? 'border-primary bg-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setSubtitleStyle('bold')}
                            >
                              Bold
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className='text-xs'>Position</Label>
                          <div className='mt-1 grid grid-cols-3 gap-2'>
                            <div
                              className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                                subtitlePosition === 'top'
                                  ? 'border-primary bg-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setSubtitlePosition('top')}
                            >
                              Top
                            </div>
                            <div
                              className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                                subtitlePosition === 'bottom'
                                  ? 'border-primary bg-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setSubtitlePosition('bottom')}
                            >
                              Bottom
                            </div>
                            <div
                              className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                                subtitlePosition === 'floating'
                                  ? 'border-primary bg-primary/10'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setSubtitlePosition('floating')}
                            >
                              Floating
                            </div>
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
                          <div
                            className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                              musicStyle === 'upbeat'
                                ? 'border-primary bg-primary/10'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setMusicStyle('upbeat')}
                          >
                            Upbeat
                          </div>
                          <div
                            className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                              musicStyle === 'relaxing'
                                ? 'border-primary bg-primary/10'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setMusicStyle('relaxing')}
                          >
                            Relaxing
                          </div>
                          <div
                            className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                              musicStyle === 'dramatic'
                                ? 'border-primary bg-primary/10'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setMusicStyle('dramatic')}
                          >
                            Dramatic
                          </div>
                          <div
                            className={`cursor-pointer rounded-md border p-2 text-center text-xs ${
                              musicStyle === 'corporate'
                                ? 'border-primary bg-primary/10'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setMusicStyle('corporate')}
                          >
                            Corporate
                          </div>
                        </div>

                        <div>
                          <div className='mb-1 flex justify-between'>
                            <Label className='text-xs'>Volume</Label>
                            <span className='text-xs text-muted-foreground'>
                              {musicVolume[0]}%
                            </span>
                          </div>
                          <Slider
                            value={musicVolume}
                            onValueChange={setMusicVolume}
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
            </div>

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
                <div className='text-center'>
                  <Video className='mx-auto h-12 w-12 text-muted-foreground' />
                  <p className='mt-2 text-muted-foreground'>Video Preview</p>
                  {!isPreviewReady && (
                    <Button
                      variant='outline'
                      size='sm'
                      className='mt-4 flex items-center gap-2'
                      // onClick={startRender}
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
                  )}
                </div>
              </div>

              {isPreviewReady && (
                <div className='flex items-center justify-between bg-muted/30 p-4'>
                  <div className='flex items-center space-x-4'>
                    <Button size='sm' variant='outline'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='h-4 w-4'
                      >
                        <polygon points='5 3 19 12 5 21 5 3'></polygon>
                      </svg>
                    </Button>
                    <div className='h-1 w-48 rounded-full bg-muted-foreground/30'>
                      <div className='h-1 w-1/3 rounded-full bg-primary'></div>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      00:00 / {Math.floor(totalDuration / 60)}:
                      {(totalDuration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button size='sm' variant='outline'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='h-4 w-4'
                      >
                        <polygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5'></polygon>
                        <path d='M15.54 8.46a5 5 0 0 1 0 7.07'></path>
                        <path d='M19.07 4.93a10 10 0 0 1 0 14.14'></path>
                      </svg>
                    </Button>
                    <Button size='sm' variant='outline'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='h-4 w-4'
                      >
                        <rect
                          x='2'
                          y='2'
                          width='20'
                          height='20'
                          rx='5'
                          ry='5'
                        ></rect>
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className='flex justify-between'>
              <Button variant='outline' onClick={() => setActiveTab('effects')}>
                Back to Effects
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!isPreviewReady || isEditorComplete}
              >
                {isEditorComplete ? (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    Video Editing Complete
                  </>
                ) : (
                  'Finalize Video'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
