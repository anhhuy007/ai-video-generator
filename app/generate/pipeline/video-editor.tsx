'use client'

import { useState, useEffect, useRef } from 'react'
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
  ChevronUp
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

// Mock data for images and audio files
const MOCK_MEDIA_ITEMS = [
  {
    id: 'item-1',
    title: 'Introduction',
    image: '/placeholder.jpg?height=200&width=350&text=Introduction',
    audio: '/mock-audio-1.mp3',
    duration: 15
  },
  {
    id: 'item-2',
    title: 'Historical Context',
    image: '/placeholder.jpg?height=200&width=350&text=Historical+Context',
    audio: '/mock-audio-2.mp3',
    duration: 22
  },
  {
    id: 'item-3',
    title: 'Current Applications',
    image: '/placeholder.jpg?height=200&width=350&text=Current+Applications',
    audio: '/mock-audio-3.mp3',
    duration: 18
  },
  {
    id: 'item-4',
    title: 'Future Possibilities',
    image: '/placeholder.jpg?height=200&width=350&text=Future+Possibilities',
    audio: '/mock-audio-4.mp3',
    duration: 20
  },
  {
    id: 'item-5',
    title: 'Ethical Considerations',
    image: '/placeholder.jpg?height=200&width=350&text=Ethical+Considerations',
    audio: '/mock-audio-5.mp3',
    duration: 25
  },
  {
    id: 'item-6',
    title: 'Conclusion',
    image: '/placeholder.jpg?height=200&width=350&text=Conclusion',
    audio: '/mock-audio-6.mp3',
    duration: 12
  },
  {
    id: 'item-7',
    title: 'Introduction',
    image: '/placeholder.jpg?height=200&width=350&text=Introduction',
    audio: '/mock-audio-1.mp3',
    duration: 15
  },
  {
    id: 'item-8',
    title: 'Historical Context',
    image: '/placeholder.jpg?height=200&width=350&text=Historical+Context',
    audio: '/mock-audio-2.mp3',
    duration: 22
  },
  {
    id: 'item-9',
    title: 'Current Applications',
    image: '/placeholder.jpg?height=200&width=350&text=Current+Applications',
    audio: '/mock-audio-3.mp3',
    duration: 18
  },
  {
    id: 'item-10',
    title: 'Future Possibilities',
    image: '/placeholder.jpg?height=200&width=350&text=Future+Possibilities',
    audio: '/mock-audio-4.mp3',
    duration: 20
  },
  {
    id: 'item-11',
    title: 'Ethical Considerations',
    image: '/placeholder.jpg?height=200&width=350&text=Ethical+Considerations',
    audio: '/mock-audio-5.mp3',
    duration: 25
  },
  {
    id: 'item-12',
    title: 'Conclusion',
    image: '/placeholder.jpg?height=200&width=350&text=Conclusion',
    audio: '/mock-audio-6.mp3',
    duration: 12
  }
]

// Transition options
const TRANSITIONS = [
  { id: 'none', name: 'None' },
  { id: 'fade', name: 'Fade' },
  { id: 'slide', name: 'Slide' },
  { id: 'zoom', name: 'Zoom' },
  { id: 'wipe', name: 'Wipe' },
  { id: 'dissolve', name: 'Dissolve' }
]

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

  // Timeline items state
  const [videoItems, setVideoItems] = useState(MOCK_MEDIA_ITEMS)
  // const [timelineItems, setTimelineItems] = useState<any[]>([])
  // const [transitions, setTransitions] = useState<{ [key: string]: string }>({})

  // Add a playhead indicator that shows current playback position
  // Add this state near the other state declarations:
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Audio playback state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Calculate total duration
  const totalDuration = videoItems.reduce(
    (total, item) => total + item.duration,
    0
  )

  // Update completion status when editor is complete
  useEffect(() => {
    if (isEditorComplete) {
      onComplete()
    }
  }, [isEditorComplete, onComplete])

  // Add this function to handle playback simulation:

  // Simulate playback with moving playhead
  const simulatePlayback = () => {
    // if (timelineItems.length === 0) return
    if (videoItems.length === 0) return
    setIsPlaying(true)
    setPlaybackPosition(0)

    // Simulate playback by moving the playhead
    const interval = setInterval(() => {
      setPlaybackPosition(prev => {
        if (prev >= totalDuration) {
          clearInterval(interval)
          setIsPlaying(false)
          return 0
        }
        return prev + 0.1 // Increment by 100ms
      })
    }, 100)

    // Store interval ID for cleanup
    return () => clearInterval(interval)
  }

  // Update the preview button in the preview tab to use the simulation:
  // Find the handlePreview function and replace it with:
  const handlePreview = () => {
    setIsPreviewReady(true)
    const cleanup = simulatePlayback()

    // Clean up the interval when preview is done
    setTimeout(() => {
      if (cleanup) cleanup()
    }, totalDuration * 1000)
  }

  const handleComplete = () => {
    setIsEditorComplete(true)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    setVideoItems(prev => {
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
              <CardContent className='p-4'>
                <Label className='mb-4 block text-base font-medium'>
                  Available Media
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
                        {videoItems.length === 0 ? (
                          <div className='w-full py-8 text-center text-muted-foreground'>
                            <p>All items have been added to the timeline</p>
                          </div>
                        ) : (
                          videoItems.map((item, index) => (
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
                            <div className='cursor-pointer rounded-md border border-primary bg-primary/10 p-2 text-center text-xs'>
                              Standard
                            </div>
                            <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                              Minimal
                            </div>
                            <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                              Bold
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className='text-xs'>Position</Label>
                          <div className='mt-1 grid grid-cols-3 gap-2'>
                            <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                              Top
                            </div>
                            <div className='cursor-pointer rounded-md border border-primary bg-primary/10 p-2 text-center text-xs'>
                              Bottom
                            </div>
                            <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
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
                          <div className='cursor-pointer rounded-md border border-primary bg-primary/10 p-2 text-center text-xs'>
                            Upbeat
                          </div>
                          <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                            Relaxing
                          </div>
                          <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                            Dramatic
                          </div>
                          <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
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
                    className='cursor-pointer rounded-md border p-2 text-center text-sm hover:bg-muted/50'
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
                      className='mt-4'
                      onClick={handlePreview}
                    >
                      Generate Preview
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
