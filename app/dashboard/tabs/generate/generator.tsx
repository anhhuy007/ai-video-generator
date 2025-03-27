'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Wand2, Loader2, Clock, Video } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function VideoGenerator() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState([15])
  const [resolution, setResolution] = useState('1080p')

  const handleGenerate = () => {
    if (!prompt) return

    setIsGenerating(true)
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          return 100
        }
        return prev + 5
      })
    }, 500)
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Video className='text-primary h-5 w-5' />
          Generate Video
        </CardTitle>
        <CardDescription>
          Describe the video you want to create in detail. Be specific about
          scenes, actions, and style.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='prompt'>Prompt</Label>
          <Textarea
            id='prompt'
            placeholder='A cinematic shot of a person walking through a futuristic city with neon lights and flying cars...'
            className='min-h-32 resize-none'
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='duration'>Duration (seconds)</Label>
              <span className='text-muted-foreground text-sm'>
                {duration[0]}s
              </span>
            </div>
            <Slider
              id='duration'
              min={5}
              max={60}
              step={5}
              value={duration}
              onValueChange={setDuration}
              disabled={isGenerating}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='resolution'>Resolution</Label>
            <Select
              value={resolution}
              onValueChange={setResolution}
              disabled={isGenerating}
            >
              <SelectTrigger id='resolution'>
                <SelectValue placeholder='Select resolution' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='720p'>720p</SelectItem>
                <SelectItem value='1080p'>1080p</SelectItem>
                <SelectItem value='4k'>4K</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isGenerating && (
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Generating video...</span>
              <span className='text-muted-foreground text-sm'>{progress}%</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>
        )}
      </CardContent>
      <CardFooter className='flex items-center justify-between'>
        <div className='text-muted-foreground flex items-center gap-1 text-sm'>
          <Clock className='h-4 w-4' />
          <span>Estimated time: {Math.ceil(duration[0] / 5)} minutes</span>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className='gap-2'
        >
          {isGenerating ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Generating
            </>
          ) : (
            <>
              <Wand2 className='h-4 w-4' />
              Generate Video
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
