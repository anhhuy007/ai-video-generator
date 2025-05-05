'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Check, Facebook, Loader2, Youtube } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useGenerationStore } from '@/store/useGenerationStore'
import axios from 'axios'

const RESOLUTIONS = [
  {
    id: '720p',
    name: 'HD (720p)',
    description: 'Good balance of quality and file size'
  },
  {
    id: '1080p',
    name: 'Full HD (1080p)',
    description: 'High quality, standard for most platforms'
  },
  {
    id: '4k',
    name: '4K Ultra HD',
    description: 'Highest quality, larger file size'
  }
]

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: <Youtube className='h-5 w-5' /> },
  { id: 'facebook', name: 'Facebook', icon: <Facebook className='h-5 w-5' /> },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: (
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
        className='h-5 w-5'
      >
        <path d='M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'></path>
        <path d='M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'></path>
        <path d='M15 8v8a4 4 0 0 1-4 4'></path>
        <path d='M15 8h-4'></path>
      </svg>
    )
  }
]

export default function Publishing({ onComplete }: { onComplete: () => void }) {
  const [resolution, setResolution] = useState('1080p')
  const [activeTab, setActiveTab] = useState('metadata')
  const [title, setTitle] = useState(
    'AI Generated Video - The Evolution of Artificial Intelligence'
  )
  const [description, setDescription] = useState(
    'An in-depth exploration of artificial intelligence, its history, current state, and future possibilities.'
  )
  const [tags, setTags] = useState(
    'AI, artificial intelligence, technology, future'
  )
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const { video_url } = useGenerationStore()

  useEffect(() => {
    // Check YouTube authentication status
    const checkAuthStatus = () => {
      const hasToken = document.cookie.includes('youtube_access_token=')
      setIsAuthenticated(hasToken)
    }

    checkAuthStatus()
  }, [])

  const handleAuthenticate = () => {
    // Redirect the user to the authentication API
    window.location.href = '/api/auth/youtube'
  }

  const handlePublish = async () => {
    if (!isAuthenticated) {
      handleAuthenticate()
      return
    }

    if (!video_url) {
      alert('No video to publish')
      return
    }

    setIsPublishing(true)

    try {
      // Download video from URL
      const videoResponse = await axios.get(video_url, { responseType: 'blob' })
      const videoBlob = videoResponse.data
      const videoFile = new File([videoBlob], 'video.mp4', {
        type: 'video/mp4'
      })

      // Create FormData
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('tags', tags)
      formData.append('privacyStatus', 'unlisted') // or 'public', 'private'

      // Send upload request
      const response = await axios.post('/api/youtube/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          console.log(`Upload progress: ${percentCompleted}%`)
        }
      })

      // Handle result
      if (response.data.success) {
        setIsPublished(true)
        setPublishedUrl(response.data.youtubeUrl)
      } else {
        throw new Error('An error occurred while uploading the video')
      }
    } catch (error) {
      console.error('Error publishing video:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      alert(`Upload failed: ${errorMessage}`)
    } finally {
      setIsPublishing(false)
    }
  }

  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== platformId))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId])
    }
  }

  // Update completion status when publishing is complete
  useEffect(() => {
    if (isPublished) {
      onComplete()
    }
  }, [isPublished, onComplete])

  return (
    <div>
      <h2 className='mb-4 text-2xl font-bold'>
        Publishing & Content Management
      </h2>
      <p className='mb-6 text-muted-foreground'>
        Prepare your video for publishing by adding metadata and selecting
        platforms.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-3'>
          <TabsTrigger value='metadata'>Metadata</TabsTrigger>
          <TabsTrigger value='export'>Export Options</TabsTrigger>
          <TabsTrigger value='publish'>Publish</TabsTrigger>
        </TabsList>

        <TabsContent value='metadata'>
          <div className='space-y-6'>
            <div>
              <Label htmlFor='title'>Video Title</Label>
              <Input
                id='title'
                value={title}
                onChange={e => setTitle(e.target.value)}
                className='mt-1'
              />
            </div>

            <div>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                className='mt-1 min-h-[100px]'
              />
            </div>

            <div>
              <Label htmlFor='tags'>Tags (comma separated)</Label>
              <Input
                id='tags'
                value={tags}
                onChange={e => setTags(e.target.value)}
                className='mt-1'
              />
            </div>

            <div className='flex justify-between'>
              <Button variant='outline' disabled>
                Back
              </Button>
              <Button onClick={() => setActiveTab('export')}>
                Continue to Export Options
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='export'>
          <div className='space-y-6'>
            <div>
              <Label>Video Resolution</Label>
              <RadioGroup
                value={resolution}
                onValueChange={setResolution}
                className='mt-2'
              >
                {RESOLUTIONS.map(res => (
                  <div
                    key={res.id}
                    className='mb-2 flex items-start space-x-2 rounded-md border p-3'
                  >
                    <RadioGroupItem
                      value={res.id}
                      id={res.id}
                      className='mt-1'
                    />
                    <div>
                      <Label htmlFor={res.id} className='font-medium'>
                        {res.name}
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        {res.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className='flex justify-between'>
              <Button
                variant='outline'
                onClick={() => setActiveTab('metadata')}
              >
                Back to Metadata
              </Button>
              <Button onClick={() => setActiveTab('publish')}>
                Continue to Publish
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='publish'>
          <div className='space-y-6'>
            <div>
              <Label className='mb-2 block'>
                Publish to Platforms (Optional)
              </Label>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {PLATFORMS.map(platform => (
                  <Card
                    key={platform.id}
                    className={`cursor-pointer transition-colors hover:border-primary ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-primary bg-primary/10'
                        : ''
                    }`}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <CardContent className='flex items-center justify-between p-4'>
                      <div className='flex items-center space-x-2'>
                        <span className='flex-shrink-0'>{platform.icon}</span>
                        <span>{platform.name}</span>
                      </div>
                      <Switch
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={() => togglePlatform(platform.id)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className='rounded-md bg-muted/50 p-4'>
              <h3 className='mb-2 font-medium'>Publishing Summary</h3>
              <ul className='space-y-1 text-sm'>
                <li>
                  <span className='font-medium'>Title:</span> {title}
                </li>
                <li>
                  <span className='font-medium'>Description:</span>{' '}
                  {description.substring(0, 50)}...
                </li>
                <li>
                  <span className='font-medium'>Tags:</span> {tags}
                </li>
                <li>
                  <span className='font-medium'>Resolution:</span> {resolution}
                </li>
                <li>
                  <span className='font-medium'>Platforms:</span>{' '}
                  {selectedPlatforms.length > 0
                    ? selectedPlatforms
                        .map(p => PLATFORMS.find(plat => plat.id === p)?.name)
                        .join(', ')
                    : 'None (Local Export Only)'}
                </li>
              </ul>
            </div>

            <div className='flex justify-between'>
              <Button variant='outline' onClick={() => setActiveTab('export')}>
                Back to Export Options
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || isPublished}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Publishing...
                  </>
                ) : isPublished ? (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    Published Successfully
                  </>
                ) : (
                  'Publish Video'
                )}
              </Button>
            </div>

            {isPublished && (
              <div className='mt-4 rounded-md border border-green-500 bg-green-50 p-4'>
                <div className='mb-2 flex items-center text-green-700'>
                  <Check className='mr-2 h-5 w-5' />
                  <h3 className='font-medium'>Video Published Successfully!</h3>
                </div>
                <p className='text-sm text-green-600'>
                  Your video has been published and is now available in your
                  content library.
                  {selectedPlatforms.length > 0 &&
                    ' It has also been uploaded to the selected platforms.'}
                </p>
                <div className='mt-4'>
                  <Button variant='outline' className='w-full'>
                    View in Content Library
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
