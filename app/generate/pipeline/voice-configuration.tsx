'use client'

import { useState, useEffect, use } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Play, Upload } from 'lucide-react'

const VOICE_PROVIDERS = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    voices: ['Rachel', 'Thomas', 'Emily', 'Josh']
  },
  {
    id: 'google',
    name: 'Google TTS',
    voices: ['Standard', 'Wavenet', 'Neural2', 'Studio']
  },
  {
    id: 'amazon',
    name: 'Amazon Polly',
    voices: ['Joanna', 'Matthew', 'Kimberly', 'Joey']
  }
]

export default function VoiceConfiguration({
  onComplete
}: {
  onComplete: () => void
}) {
  const [provider, setProvider] = useState('elevenlabs')
  const [voice, setVoice] = useState('Rachel')
  const [speed, setSpeed] = useState([1])
  const [tone, setTone] = useState([5])
  const [intensity, setIntensity] = useState([5])
  const [isPlaying, setIsPlaying] = useState(false)
  const [useCustomVoice, setUseCustomVoice] = useState(false)
  const [activeTab, setActiveTab] = useState('provider')
  const [isConfigurationComplete, setIsConfigurationComplete] = useState(false)

  // Track if voice has been previewed
  const [voicePreviewed, setVoicePreviewed] = useState(false)

  const selectedProvider = VOICE_PROVIDERS.find(p => p.id === provider)

  // Update completion status when configuration is complete
  useEffect(() => {
    if (isConfigurationComplete) {
      onComplete()
    }
  }, [isConfigurationComplete, onComplete])

  const handlePreviewVoice = () => {
    setIsPlaying(true)
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false)
      setVoicePreviewed(true)
    }, 3000)
  }

  const handleComplete = () => {
    setIsConfigurationComplete(true)
  }


  return (
    <div>
      <h2 className='mb-4 text-2xl font-bold'>Voice Configuration</h2>
      <p className='mb-6 text-muted-foreground'>
        Select a voice provider, customize voice settings, and preview before
        applying.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-3'>
          <TabsTrigger value='provider'>Voice Provider</TabsTrigger>
          <TabsTrigger value='settings'>Voice Settings</TabsTrigger>
          <TabsTrigger value='preview'>Preview & Apply</TabsTrigger>
        </TabsList>

        <TabsContent value='provider'>
          <div className='space-y-6'>
            <div>
              <Label>Select Voice Provider</Label>
              <div className='mt-2 grid grid-cols-1 gap-4 md:grid-cols-3'>
                {VOICE_PROVIDERS.map(voiceProvider => (
                  <Card
                    key={voiceProvider.id}
                    className={`cursor-pointer transition-colors hover:border-primary ${provider === voiceProvider.id ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => setProvider(voiceProvider.id)}
                  >
                    <CardContent className='flex items-center justify-between p-4'>
                      <span className='font-medium'>{voiceProvider.name}</span>
                      {provider === voiceProvider.id && (
                        <Check className='h-4 w-4 text-primary' />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label>Select Voice</Label>
              <RadioGroup
                value={voice}
                onValueChange={setVoice}
                className='mt-2 grid grid-cols-2 gap-2'
              >
                {selectedProvider?.voices.map(voiceOption => (
                  <div
                    key={voiceOption}
                    className='flex items-center space-x-2 rounded-md border p-3'
                  >
                    <RadioGroupItem value={voiceOption} id={voiceOption} />
                    <Label htmlFor={voiceOption}>{voiceOption}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='custom-voice'
                checked={useCustomVoice}
                onChange={() => setUseCustomVoice(!useCustomVoice)}
                className='rounded border-gray-300'
              />
              <Label htmlFor='custom-voice'>
                Use my own voice recording instead
              </Label>
            </div>

            {useCustomVoice && (
              <div className='rounded-md border-2 border-dashed p-6 text-center'>
                <Upload className='mx-auto mb-2 h-8 w-8 text-muted-foreground' />
                <p className='mb-2 text-sm text-muted-foreground'>
                  Drag and drop your voice recording here, or click to browse
                </p>
                <Button variant='outline' size='sm'>
                  Upload Voice File
                </Button>
              </div>
            )}

            <Button onClick={() => setActiveTab('settings')} className='w-full'>
              Continue to Voice Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value='settings'>
          <div className='space-y-6'>
            <div>
              <div className='mb-2 flex justify-between'>
                <Label>Reading Speed</Label>
                <span className='text-sm text-muted-foreground'>
                  {speed[0]}x
                </span>
              </div>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={2}
                step={0.1}
              />
              <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>

            <div>
              <div className='mb-2 flex justify-between'>
                <Label>Tone</Label>
                <span className='text-sm text-muted-foreground'>{tone[0]}</span>
              </div>
              <Slider
                value={tone}
                onValueChange={setTone}
                min={1}
                max={10}
                step={1}
              />
              <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
                <span>Formal</span>
                <span>Casual</span>
              </div>
            </div>

            <div>
              <div className='mb-2 flex justify-between'>
                <Label>Intensity</Label>
                <span className='text-sm text-muted-foreground'>
                  {intensity[0]}
                </span>
              </div>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                min={1}
                max={10}
                step={1}
              />
              <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
                <span>Calm</span>
                <span>Energetic</span>
              </div>
            </div>

            <div className='flex justify-between'>
              <Button
                variant='outline'
                onClick={() => setActiveTab('provider')}
              >
                Back to Provider
              </Button>
              <Button onClick={() => setActiveTab('preview')}>
                Continue to Preview
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='preview'>
          <div className='space-y-6'>
            <div className='rounded-md bg-muted/50 p-4'>
              <h3 className='mb-2 font-medium'>Voice Configuration Summary</h3>
              <ul className='space-y-1 text-sm'>
                <li>
                  <span className='font-medium'>Provider:</span>{' '}
                  {selectedProvider?.name}
                </li>
                <li>
                  <span className='font-medium'>Voice:</span>{' '}
                  {useCustomVoice ? 'Custom Voice Recording' : voice}
                </li>
                <li>
                  <span className='font-medium'>Speed:</span> {speed[0]}x
                </li>
                <li>
                  <span className='font-medium'>Tone:</span> {tone[0]}/10
                </li>
                <li>
                  <span className='font-medium'>Intensity:</span> {intensity[0]}
                  /10
                </li>
              </ul>
            </div>

            <div className='flex justify-center'>
              <Button
                variant='outline'
                size='lg'
                className='w-full md:w-auto'
                onClick={handlePreviewVoice}
                disabled={isPlaying}
              >
                {isPlaying ? (
                  <span className='flex items-center'>
                    <span className='mr-2 animate-pulse'>●</span>
                    Playing preview...
                  </span>
                ) : (
                  <>
                    <Play className='mr-2 h-4 w-4' />
                    Preview Voice
                  </>
                )}
              </Button>
            </div>

            <div className='flex justify-between'>
              <Button
                variant='outline'
                onClick={() => setActiveTab('settings')}
              >
                Back to Settings
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isConfigurationComplete}
              >
                {isConfigurationComplete ? (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    Voice Configured
                  </>
                ) : (
                  'Apply Voice Configuration'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
