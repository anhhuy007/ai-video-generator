'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Check,
  Loader2,
  Youtube,
  Globe,
  Lock,
  Eye,
  Database,
  Save
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useGenerationStore } from '@/store/useGenerationStore'
import { YouTubeTokens } from '@/app/service/youtube.service'
import axios from 'axios'

export default function Publishing({ onComplete }: { onComplete: () => void }) {
  const [title, setTitle] = useState(
    'AI Generated Video - The Evolution of Artificial Intelligence'
  )
  const [description, setDescription] = useState(
    'An in-depth exploration of artificial intelligence, its history, current state, and future possibilities.'
  )
  const [tags, setTags] = useState(
    'AI, artificial intelligence, technology, future'
  )
  const [privacyStatus, setPrivacyStatus] = useState('public')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null)

  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { video_url, story } = useGenerationStore()

  // Check if we have YouTube tokens on mount
  useEffect(() => {
    const tokensString = sessionStorage.getItem('youtubeTokens')
    if (tokensString) {
      try {
        const tokens = JSON.parse(tokensString)
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Invalid YouTube tokens in storage')
        setIsAuthenticated(false)
      }
    }
  }, [])

  // Update completion status when publishing is complete
  useEffect(() => {
    if (isPublished && isSaved) {
      onComplete()
    }
  }, [isPublished, isSaved, onComplete])

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

  const saveVideoUrl = async (
    videoUrl: string,
    title: string,
    category: string
  ) => {
    const videoDuration = await getAudioDuration(videoUrl)
    const durationInt = Math.round(videoDuration)

    const response = await axios.post('/api/gallery', {
      videoUrl,
      title,
      category,
      duration: durationInt
    })

    if (!response || !response.data.galleryEntry) {
      throw new Error('Cannot save video. Please try again later')
    }

    return response.data.galleryEntry
  }

  const saveVideoToHistory = async (prompt: string, galleryId: string) => {
    const response = await axios.post('api/gen_history', {
      prompt,
      galleryId
    })

    if (!response || !response.data || !response.data) {
      throw new Error('Cannot save video to history. Please try again later')
    }

    return response
  }

  const saveYoutubeUrl = async (
    genHistoryId: string,
    youtubeUrl: string,
    description: string,
    tags: string
  ) => {
    const response = await axios.post('/api/youtube ', {
      genHistoryId,
      youtubeUrl,
      description,
      tags
    })

    if (!response || !response.data) {
      throw new Error('Cannot save youtube URL. Please try again later')
    }

    return response
  }

  const handleSaveAll = async () => {
    try {
      setIsSaving(true)

      // Step 1: create a gallery entry
      const galleryEntry = await saveVideoUrl(video_url, title, tags)

      // Step 2: Create a gen history entry
      const genHistoryData = await saveVideoToHistory(
        story.prompt,
        galleryEntry.id
      )

      // Step 3: Save youtube url
      if (!youtubeUrl) {
        throw new Error('Please upload video to youtube first.')
      }

      const youtubeData = await saveYoutubeUrl(
        genHistoryData.data.historyEntry.id,
        youtubeUrl,
        description,
        tags
      )

      console.log('YouTube entry created:', youtubeData)
      setIsSaved(true)
    } catch (error: any) {
      console.error('Upload or API error:', error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAuthYouTube = async () => {
    setIsAuthenticating(true)
    try {
      setError(null)
      const response = await fetch('/api/youtube/auth-url')

      if (!response.ok) {
        throw new Error(
          `Failed to get auth URL: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      if (data.success && data.authUrl) {
        // Save current page path for redirecting back after auth
        sessionStorage.setItem('youtubeAuthRedirect', window.location.pathname)

        // Open YouTube OAuth in a popup window
        const width = 500
        const height = 600
        const left = (window.innerWidth - width) / 2
        const top = (window.innerHeight - height) / 2

        const popup = window.open(
          data.authUrl,
          'YouTubeAuthPopup',
          `width=${width},height=${height},top=${top},left=${left}`
        )

        // Listen for message from the popup window
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return
          const tokens = event.data?.youtubeTokens
          if (tokens) {
            sessionStorage.setItem('youtubeTokens', JSON.stringify(tokens))
            setIsAuthenticated(true)
            setIsAuthenticating(false)
            window.removeEventListener('message', handleMessage)
          }
        }

        window.addEventListener('message', handleMessage)
      } else {
        throw new Error(data.message || 'Failed to get authorization URL')
      }
    } catch (error: any) {
      setError(`Authentication error: ${error.message}`)
      console.error('YouTube auth error:', error)
    }
  }

  const handlePublish = async () => {
    try {
      setIsPublishing(true)
      setError(null)

      // Get tokens from storage
      const tokensString = sessionStorage.getItem('youtubeTokens')
      if (!tokensString) {
        throw new Error('YouTube authentication required')
      }

      const tokens: YouTubeTokens = JSON.parse(tokensString)

      // Make API call to upload video
      const response = await fetch('/api/youtube/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoUrl: video_url,
          title,
          description,
          tags,
          privacyStatus,
          tokens
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Failed to upload: ${response.status} ${response.statusText} - ${errorText}`
        )
      }

      const data = await response.json()

      if (data.success) {
        setYoutubeUrl(data.youtubeUrl)
        setIsPublished(true)
        console.log('Video published successfully:', data.youtubeUrl)
      } else {
        throw new Error(data.message || 'Failed to upload to YouTube')
      }
    } catch (error: any) {
      setError(`Publishing error: ${error.message}`)
      console.error('Publishing error:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div>
      <h2 className='mb-4 text-2xl font-bold'>Publishing</h2>
      <p className='mb-6 text-muted-foreground'>
        Prepare your video for publishing to YouTube.
      </p>

      <div className='space-y-6'>
        <Card>
          <CardContent className='space-y-6 p-6'>
            {/* Video Metadata */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium'>Video Information</h3>

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
                <Label htmlFor='tags'>Tags</Label>
                <Input
                  id='tags'
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className='mt-1'
                />
                <p className='mt-1 text-sm text-muted-foreground'>
                  Add multiple tags by separating them with commas (e.g., AI,
                  technology, future)
                </p>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className='border-t pt-4'>
              <Label className='mb-2 block'>Privacy Status</Label>
              <RadioGroup
                value={privacyStatus}
                onValueChange={setPrivacyStatus}
                className='space-y-2'
              >
                <div className='flex items-center space-x-2 rounded-md border p-3'>
                  <RadioGroupItem value='public' id='public' />
                  <Label
                    htmlFor='public'
                    className='flex cursor-pointer items-center'
                  >
                    <Globe className='mr-2 h-4 w-4 text-green-600' />
                    <div>
                      <span className='font-medium'>Public</span>
                      <p className='text-xs text-muted-foreground'>
                        Anyone can search for and view
                      </p>
                    </div>
                  </Label>
                </div>

                <div className='flex items-center space-x-2 rounded-md border p-3'>
                  <RadioGroupItem value='unlisted' id='unlisted' />
                  <Label
                    htmlFor='unlisted'
                    className='flex cursor-pointer items-center'
                  >
                    <Eye className='mr-2 h-4 w-4 text-amber-600' />
                    <div>
                      <span className='font-medium'>Unlisted</span>
                      <p className='text-xs text-muted-foreground'>
                        Only accessible with the link
                      </p>
                    </div>
                  </Label>
                </div>

                <div className='flex items-center space-x-2 rounded-md border p-3'>
                  <RadioGroupItem value='private' id='private' />
                  <Label
                    htmlFor='private'
                    className='flex cursor-pointer items-center'
                  >
                    <Lock className='mr-2 h-4 w-4 text-gray-600' />
                    <div>
                      <span className='font-medium'>Private</span>
                      <p className='text-xs text-muted-foreground'>
                        Only you can view
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Publishing Summary */}
            {!isPublished && (
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
                    <span className='font-medium'>Privacy:</span>{' '}
                    {privacyStatus === 'public'
                      ? 'Public (Anyone can view)'
                      : privacyStatus === 'unlisted'
                        ? 'Unlisted (Only accessible with link)'
                        : 'Private (Only you can view)'}
                  </li>
                  <li>
                    <span className='font-medium'>Platform:</span> YouTube
                  </li>
                </ul>
              </div>
            )}

            {/* Authentication and Publish Buttons */}
            {!isPublished ? (
              !isAuthenticated ? (
                <Button
                  onClick={handleAuthYouTube}
                  className='w-full'
                  size='lg'
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Youtube className='mr-2 h-5 w-5 text-red-600' />
                      Connect to YouTube
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className='w-full'
                  size='lg'
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Publishing...
                    </>
                  ) : (
                    'Publish Video'
                  )}
                </Button>
              )
            ) : !isSaved ? (
              <Button
                onClick={handleSaveAll}
                disabled={isSaving}
                className='w-full'
                size='lg'
              >
                {isSaving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving to Database...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Save All to Database
                  </>
                )}
              </Button>
            ) : (
              <Button variant='outline' className='w-full' size='lg'>
                <Check className='mr-2 h-4 w-4' />
                All Changes Saved
              </Button>
            )}

            {/* Authentication Status */}
            {isAuthenticated && !isPublished && (
              <div className='flex items-center justify-center text-sm text-green-600'>
                <Check className='mr-1 h-4 w-4' />
                Connected to YouTube
              </div>
            )}

            {/* Success Message */}
            {isPublished && (
              <div className='mt-4 rounded-md border border-green-500 bg-green-50 p-4'>
                <div className='mb-2 flex items-center text-green-700'>
                  <Check className='mr-2 h-5 w-5' />
                  <h3 className='font-medium'>Video Published Successfully!</h3>
                </div>
                <p className='text-sm text-green-600'>
                  Your video has been published to YouTube with {privacyStatus}{' '}
                  privacy settings.
                  {isSaved && ' All changes have been saved to the database.'}
                </p>

                {isSaved && (
                  <div className='mt-4'>
                    <Button variant='outline' className='w-full'>
                      View in Content Library
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Database Saved Message */}
            {isSaved && (
              <div className='mt-2 flex items-center justify-center text-sm text-green-600'>
                <Database className='mr-1 h-4 w-4' />
                All data saved to database
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
