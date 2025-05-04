'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Check, Play, Info, Pause } from 'lucide-react'
import { useGenerationStore } from '@/store/useGenerationStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import axios from 'axios'
import { elevenlabs } from '@/lib/elevenlabs'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

// Define options for speed, stability and style
const SPEED_OPTIONS = [
  { value: '0.7', label: '0.7 (Very Slow)' },
  { value: '0.8', label: '0.8 (Slow)' },
  { value: '0.9', label: '0.9 (Slightly Slow)' },
  { value: '1.0', label: '1.0 (Normal)' },
  { value: '1.1', label: '1.1 (Slightly Fast)' },
  { value: '1.2', label: '1.2 (Fast)' }
]

const STABILITY_OPTIONS = [
  { value: '0', label: '0 (Maximum Emotion)' },
  { value: '0.25', label: '0.25 (High Emotion)' },
  { value: '0.5', label: '0.5 (Balanced)' },
  { value: '0.75', label: '0.75 (Stable)' },
  { value: '1', label: '1 (Maximum Stability)' }
]

const STYLE_OPTIONS = [
  { value: '0', label: '0 (No Style)' },
  { value: '0.25', label: '0.25 (Subtle)' },
  { value: '0.5', label: '0.5 (Moderate)' },
  { value: '0.75', label: '0.75 (Strong)' },
  { value: '1', label: '1 (Maximum Style)' }
]

// Define voice interface
interface Voice {
  voice_id: string
  name: string
}

interface Mp3Url {
  id: number
  title: string
  content: string
  audioUrl: string
  duration: number
}

export default function VoiceConfiguration({
  onComplete
}: {
  onComplete: () => void
}) {
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState('')
  const [speed, setSpeed] = useState('1.0')
  const [stability, setStability] = useState('0.5')
  const [style, setStyle] = useState('0')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfigurationComplete, setIsConfigurationComplete] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { story, setMp3Url } = useGenerationStore()
  const [generatedAudioFiles, setGeneratedAudioFiles] = useState<Mp3Url[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [audioProgress, setAudioProgress] = useState<{ [key: number]: number }>(
    {}
  )
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({})

  // Fetch voices from ElevenLabs API
  useEffect(() => {
    const fetchVoices = async () => {
      setIsLoading(true)
      try {
        const voiceRes = await elevenlabs.voices.getAll()
        const fetchedVoices = voiceRes.voices as Voice[]

        setVoices(fetchedVoices)

        // Set default voice if available
        if (fetchedVoices.length > 0) {
          setSelectedVoiceId(fetchedVoices[0].voice_id)
        }
      } catch (error) {
        console.error('Error fetching voices:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVoices()
  }, [])

  // Update completion status when configuration is complete
  useEffect(() => {
    if (isConfigurationComplete) {
      onComplete()
    }
  }, [isConfigurationComplete, onComplete])

  // Get selected voice name for display
  const getSelectedVoiceName = () => {
    const selectedVoice = voices.find(v => v.voice_id === selectedVoiceId)
    return selectedVoice?.name || ''
  }

  const uploadAudioToCloudinary = async (audioBlob: Blob): Promise<string> => {
    try {
      const file = new File([audioBlob], 'narration.mp4', { type: 'audio/mp4' })

      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('/api/upload', formData)
      const uploadedFileUrl = response.data.url

      console.log('Uploaded successfully:', uploadedFileUrl)
      return uploadedFileUrl
    } catch (error) {
      console.error('Error uploading audio:', error)
      throw error
    }
  }

  const handleComplete = async () => {
    if (!selectedVoiceId || !story) {
      console.error('No story or voice selected.')
      return
    }

    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const scene of story.scenes || []) {
        const script = `# ${scene.title}\n${scene.narration}`

        const configuration = {
          text: script,
          voice: getSelectedVoiceName(),
          speed: Number.parseFloat(speed),
          stability: Number.parseFloat(stability),
          style: Number.parseFloat(style)
        }

        const response = await axios.post(
          '/api/generation/voice',
          configuration,
          {
            responseType: 'blob'
          }
        )

        const audioBlob = response.data
        const uploadedUrl = await uploadAudioToCloudinary(audioBlob)
        uploadedUrls.push(uploadedUrl)
      }

      if (setMp3Url) {
        setMp3Url(uploadedUrls)
      }
      const newGeneratedFiles: Mp3Url[] = []

      for (let i = 0; i < uploadedUrls.length; i++) {
        const url = uploadedUrls[i]
        const scene = story.scenes[i]

        const duration = await getAudioDuration(url)

        const mp3File: Mp3Url = {
          id: scene.id,
          title: scene.title,
          content: scene.description,
          audioUrl: url,
          duration: duration
        }

        newGeneratedFiles.push(mp3File)
      }

      setGeneratedAudioFiles(newGeneratedFiles)
      setIsUploading(false)
      setIsConfigurationComplete(true)
    } catch (error) {
      console.error('Error generating scene audios:', error)
    }
  }

  const getAudioDuration = (url: string): Promise<number> => {
    return new Promise(resolve => {
      const audio = new Audio(url)
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration)
      })
      audio.addEventListener('error', () => {
        resolve(0)
      })
    })
  }

  // Preview voice function
  const handlePlayPause = (id: number) => {
    if (currentlyPlaying === id) {
      if (audioRefs.current[id]) {
        audioRefs.current[id]?.pause()
      }
      setCurrentlyPlaying(null)
      return
    }

    if (currentlyPlaying !== null && audioRefs.current[currentlyPlaying]) {
      audioRefs.current[currentlyPlaying]?.pause()
    }

    if (audioRefs.current[id]) {
      audioRefs.current[id]?.play()
      setCurrentlyPlaying(id)
    }
  }

  const handleAudioEnded = (id: number) => {
    setCurrentlyPlaying(null)
    setAudioProgress(prev => ({
      ...prev,
      [id]: 0
    }))
  }

  const handleTimeUpdate = (id: number) => {
    if (audioRefs.current[id]) {
      const audio = audioRefs.current[id]
      if (audio) {
        const progress = (audio.currentTime / audio.duration) * 100
        setAudioProgress(prev => ({
          ...prev,
          [id]: progress
        }))
      }
    }
  }

  const handleSeek = (id: number, value: number[]) => {
    if (audioRefs.current[id]) {
      const audio = audioRefs.current[id]
      if (audio) {
        audio.currentTime = (value[0] / 100) * audio.duration
        setAudioProgress(prev => ({
          ...prev,
          [id]: value[0]
        }))
      }
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div>
      <h2 className='mb-4 text-xl font-medium'>Voice Configuration</h2>

      {isLoading ? (
        <div className='py-8 text-center text-muted-foreground'>
          Loading voices...
        </div>
      ) : (
        <div className='grid gap-4'>
          {/* Voice Selection */}
          <div>
            <Label htmlFor='voice-select' className='mb-2 block'>
              Voice
            </Label>
            <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
              <SelectTrigger id='voice-select'>
                <SelectValue placeholder='Select a voice' />
              </SelectTrigger>
              <SelectContent>
                {voices.map(voice => (
                  <SelectItem key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speed Setting */}
          <div>
            <div className='mb-2 flex items-center gap-2'>
              <Label htmlFor='speed-select'>Speed</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-4 w-4 text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-xs'>
                    Controls the speed of the generated speech. Values range
                    from 0.7 to 1.2, with 1.0 being the default speed. Lower
                    values create slower, more deliberate speech while higher
                    values produce faster-paced speech.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={speed} onValueChange={setSpeed}>
              <SelectTrigger id='speed-select'>
                <SelectValue placeholder='Select speed' />
              </SelectTrigger>
              <SelectContent>
                {SPEED_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stability Setting */}
          <div>
            <div className='mb-2 flex items-center gap-2'>
              <Label htmlFor='stability-select'>Stability</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-4 w-4 text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-xs'>
                    Determines how stable the voice is and the randomness
                    between each generation. Lower values introduce broader
                    emotional range for the voice. Higher values can result in a
                    monotonous voice with limited emotion.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={stability} onValueChange={setStability}>
              <SelectTrigger id='stability-select'>
                <SelectValue placeholder='Select stability' />
              </SelectTrigger>
              <SelectContent>
                {STABILITY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Style Setting */}
          <div>
            <div className='mb-2 flex items-center gap-2'>
              <Label htmlFor='style-select'>Style</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-4 w-4 text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-xs'>
                    Determines the style exaggeration of the voice. This setting
                    attempts to amplify the style of the original speaker. It
                    does consume additional computational resources and might
                    increase latency if set to anything other than 0.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger id='style-select'>
                <SelectValue placeholder='Select style' />
              </SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='mt-6 flex'>
            <Button
              onClick={handleComplete}
              disabled={
                isConfigurationComplete || !selectedVoiceId || isUploading
              }
              className='flex-1'
            >
              {isUploading ? (
                <span className='flex items-center'>
                  <span className='mr-2 animate-spin'>◯</span>
                  Uploading...
                </span>
              ) : isConfigurationComplete ? (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Successfully Applied
                </>
              ) : (
                'Apply Changes and Upload MP3 to Cloudinary'
              )}
            </Button>
          </div>

          <div>
            <h3 className='mb-4 text-lg font-medium'>Generated Audio Files</h3>
            <div className='space-y-4'>
              {generatedAudioFiles.map(file => (
                <Card key={file.id} className='overflow-hidden'>
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium'>{file.title}</h4>
                        <span className='text-xs text-muted-foreground'>
                          {formatTime(file.duration)}
                        </span>
                      </div>

                      <div className='flex items-center space-x-3'>
                        <Button
                          variant='outline'
                          size='icon'
                          className='h-8 w-8 flex-shrink-0'
                          onClick={() => handlePlayPause(file.id)}
                        >
                          {currentlyPlaying === file.id ? (
                            <Pause className='h-4 w-4' />
                          ) : (
                            <Play className='h-4 w-4' />
                          )}
                        </Button>

                        <div className='w-full space-y-1'>
                          <Slider
                            value={[audioProgress[file.id] || 0]}
                            onValueChange={value => handleSeek(file.id, value)}
                            min={0}
                            max={100}
                            step={0.1}
                            className='w-full'
                          />
                          <div className='flex justify-between text-xs text-muted-foreground'>
                            <span>
                              {formatTime(
                                (audioProgress[file.id] / 100) * file.duration
                              )}
                            </span>
                            <span>{formatTime(file.duration)}</span>
                          </div>
                        </div>

                        {/* Hidden audio element */}
                        <audio
                          ref={el => {
                            audioRefs.current[file.id] = el
                          }}
                          src={file.audioUrl}
                          onEnded={() => handleAudioEnded(file.id)}
                          onTimeUpdate={() => handleTimeUpdate(file.id)}
                          className='hidden'
                        />
                      </div>

                      <div className='rounded-md bg-muted/30 p-3 text-sm'>
                        <p>{file.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
