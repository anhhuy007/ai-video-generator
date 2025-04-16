'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Check, Play, Info } from 'lucide-react'
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

  const handlePreviewVoice = async () => {
    if (!selectedVoiceId) return

    setIsPlaying(true)
    try {
      const res = await axios.post(
        '/api/conversations',
        {
          text: 'Đây là một đoạn văn bản mẫu để kiểm tra giọng nói.',
          voiceId: selectedVoiceId,
          speed: Number.parseFloat(speed),
          stability: Number.parseFloat(stability),
          style: Number.parseFloat(style)
        },
        {
          responseType: 'blob'
        }
      )

      const audioBlob = res.data
      const url = URL.createObjectURL(audioBlob)
      const audio = new Audio(url)

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(url)
      }

      audio.play()
    } catch (error) {
      console.error('Error previewing voice:', error)
      setIsPlaying(false)
    }
  }

  const handleComplete = () => {
    if (!selectedVoiceId) return

    // Save the configuration
    const configuration = {
      voiceId: selectedVoiceId,
      voiceName: getSelectedVoiceName(),
      speed: Number.parseFloat(speed),
      stability: Number.parseFloat(stability),
      style: Number.parseFloat(style)
    }

    console.log('Voice configuration saved:', configuration)
    setIsConfigurationComplete(true)
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

          {/* Preview and Apply */}
          <div className='flex flex-col gap-3 pt-2 sm:flex-row'>
            <Button
              variant='outline'
              className='flex-1'
              onClick={handlePreviewVoice}
              disabled={isPlaying || !selectedVoiceId}
            >
              {isPlaying ? (
                <span className='flex items-center'>
                  <span className='mr-2 animate-pulse'>●</span>
                  Playing...
                </span>
              ) : (
                <>
                  <Play className='mr-2 h-4 w-4' />
                  Preview
                </>
              )}
            </Button>

            <Button
              className='flex-1'
              onClick={handleComplete}
              disabled={isConfigurationComplete || !selectedVoiceId}
            >
              {isConfigurationComplete ? (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Applied
                </>
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
