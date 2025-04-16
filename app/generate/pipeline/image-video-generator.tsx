'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import Image from 'next/image'

import {
  Check,
  ImageIcon,
  Loader2,
  RefreshCw,
  Edit,
  Maximize,
  Minimize,
  Download,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { useGenerationStore } from '@/store/useGenerationStore'
import { Scene } from '@/app/utils/type'
interface ImageVideoGeneratorProps {
  scenes: Scene[]
  onComplete?: () => void
}

const IMAGE_STYLES = [
  { id: 'realistic', name: 'Realistic' },
  { id: 'artistic', name: 'Artistic' },
  { id: 'cartoon', name: 'Cartoon' },
  { id: 'cinematic', name: 'Cinematic' }
]

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square (1:1)' },
  { id: '4:3', name: 'Standard (4:3)' },
  { id: '16:9', name: 'Widescreen (16:9)' },
  { id: '9:16', name: 'Vertical (9:16)' }
]

export default function ImageVideoGenerator({
  onComplete = () => {}
}: ImageVideoGeneratorProps) {
  const [activeTab, setActiveTab] = useState('generate')
  const [imageStyle, setImageStyle] = useState('realistic')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState<number | null>(null)
  const [motionEffect, setMotionEffect] = useState('pan')
  const [isCreatingVideo, setIsCreatingVideo] = useState(false)
  const [videoCreated, setVideoCreated] = useState(false)

  const { story } = useGenerationStore()

  // Screen-based image generation
  const [scriptScreens, setScriptScreens] = useState(story.scenes)
  const [screenImages, setScreenImages] = useState<{
    [screenId: number]: string
  }>({})
  const [selectedScreen, setSelectedScreen] = useState<number | null>(null)
  const [currentEditingScreen, setCurrentEditingScreen] = useState<
    number | null
  >(null)

  // Image editing states
  const [imageScale, setImageScale] = useState([100])
  const [brightness, setBrightness] = useState([100])
  const [contrast, setContrast] = useState([100])
  const [saturation, setSaturation] = useState([100])

  // Add a new state for editing script text
  const [editingScriptText, setEditingScriptText] = useState<string>('')
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Update completion status when all screens have images and video is created
  useEffect(() => {
    if (videoCreated) {
      onComplete()
    }
  }, [videoCreated, onComplete])

  // Check if all screens have images
  const allScreensHaveImages = () => {
    return (
      scriptScreens.length > 0 &&
      scriptScreens.every(screen => screenImages[screen.id])
    )
  }

  const generateImagePrompt = (screen: Scene, style: string) => {
    return `Generate a ${style} image of the scene: ${screen.image}`
  }

  const handleGenerateAllImages = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    const newImages: { [key: number]: string } = { ...screenImages }

    try {
      await Promise.all(
        scriptScreens.map(async screen => {
          try {
            const prompt = generateImagePrompt(screen, imageStyle)
            const response = await axios.post('/api/generation/image', {
              prompt
            })

            if (response.data.image) {
              newImages[screen.id] = response.data.image
            } else {
              console.error(`No image returned for screen ${screen.id}`)
            }
          } catch (error) {
            console.error(
              `Error generating image for screen ${screen.id}:`,
              error
            )
          }
        })
      )

      setScreenImages(newImages)
    } catch (error) {
      console.error('Error generating images:', error)
      setGenerationError(
        'Failed to generate one or more images. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerateImage = async (screenId: number) => {
    setIsRegenerating(screenId)
    setGenerationError(null)

    try {
      const screen = scriptScreens.find(s => s.id === screenId)
      if (!screen) return

      const prompt = generateImagePrompt(screen, imageStyle)
      const response = await axios.post('/api/generation/image', {
        prompt
      })

      if (response.data.image) {
        setScreenImages(prev => ({
          ...prev,
          [screenId]: response.data.image
        }))
      } else {
        throw new Error('No image returned from API')
      }
    } catch (error) {
      console.error(`Error regenerating image for screen ${screenId}:`, error)
      setGenerationError('Failed to regenerate image. Please try again.')
    } finally {
      setIsRegenerating(null)
    }
  }

  const handleSelectScreen = (screenId: number) => {
    setSelectedScreen(screenId === selectedScreen ? null : screenId)
  }

  const handleEditImage = (screenId: number) => {
    setCurrentEditingScreen(screenId)
    // Set the current script text for editing
    const screen = scriptScreens.find(s => s.id === screenId)
    if (screen) {
      setEditingScriptText(screen.image)
    }
    setActiveTab('edit')
  }

  const handleRegenerateWithScript = async () => {
    if (currentEditingScreen === null) return
    setIsRegenerating(currentEditingScreen)
    setGenerationError(null)

    // Update the script content
    const updatedScreens = scriptScreens.map(screen =>
      screen.id === currentEditingScreen
        ? { ...screen, content: editingScriptText, image: editingScriptText }
        : screen
    )
    setScriptScreens(updatedScreens)

    try {
      const screen = updatedScreens.find(s => s.id === currentEditingScreen)
      if (!screen) return

      const prompt = generateImagePrompt(screen, imageStyle)
      const response = await axios.post('/api/generation/image', {
        prompt
      })

      if (response.data.image) {
        setScreenImages(prev => ({
          ...prev,
          [currentEditingScreen]: response.data.image
        }))
      } else {
        throw new Error('No image returned from API')
      }
    } catch (error) {
      console.error(`Error regenerating image with new script:`, error)
      setGenerationError(
        'Failed to regenerate image with new script. Please try again.'
      )
    } finally {
      setIsRegenerating(null)
    }
  }

  const handleSaveEdit = () => {
    // Apply the image adjustments
    // In a real implementation, this would apply the edits to the image
    // For now, we'll just save the current state
    setActiveTab('customize')
    setCurrentEditingScreen(null)
  }

  const handleCreateVideo = () => {
    if (!allScreensHaveImages()) return

    setIsCreatingVideo(true)

    // Simulate video creation
    setTimeout(() => {
      setIsCreatingVideo(false)
      setVideoCreated(true)
    }, 4000)
  }

  const handleDownloadImage = (screenId: number) => {
    const image = screenImages[screenId]
    if (!image) return

    // Create a temporary link element
    const link = document.createElement('a')
    link.href = image
    link.download = `image-${screenId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='mx-auto w-full max-w-4xl'>
      <h2 className='mb-4 text-2xl font-bold'>AI Image & Video Generator</h2>
      <p className='mb-6 text-muted-foreground'>
        Generate images for each screen in your script, customize them, and
        create a video.
      </p>

      {generationError && (
        <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700'>
          {generationError}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-4'>
          <TabsTrigger value='generate'>Generate Images</TabsTrigger>
          <TabsTrigger
            value='customize'
            disabled={!Object.keys(screenImages).length}
          >
            Customize
          </TabsTrigger>
          <TabsTrigger value='edit' disabled={currentEditingScreen === null}>
            Edit Image
          </TabsTrigger>
          <TabsTrigger value='video' disabled={!allScreensHaveImages()}>
            Create Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value='generate'>
          <div className='space-y-6'>
            <div>
              <Label>Image Style</Label>
              <RadioGroup
                value={imageStyle}
                onValueChange={setImageStyle}
                className='mt-2 grid grid-cols-2 gap-3 md:grid-cols-4'
              >
                {IMAGE_STYLES.map(style => (
                  <div
                    key={style.id}
                    className='flex items-center space-x-2 rounded-md border p-3'
                  >
                    <RadioGroupItem value={style.id} id={style.id} />
                    <Label htmlFor={style.id}>{style.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label>Aspect Ratio</Label>
              <RadioGroup
                value={aspectRatio}
                onValueChange={setAspectRatio}
                className='mt-2 grid grid-cols-2 gap-3 md:grid-cols-4'
              >
                {ASPECT_RATIOS.map(ratio => (
                  <div
                    key={ratio.id}
                    className='flex items-center space-x-2 rounded-md border p-3'
                  >
                    <RadioGroupItem value={ratio.id} id={ratio.id} />
                    <Label htmlFor={ratio.id}>{ratio.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              onClick={handleGenerateAllImages}
              disabled={isGenerating || scriptScreens.length === 0}
              className='w-full'
            >
              {isGenerating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Generating Images for All Screens...
                </>
              ) : (
                'Generate Images for All Screens'
              )}
            </Button>

            {scriptScreens.length === 0 && (
              <div className='rounded-md border bg-muted/20 p-8 text-center'>
                <p className='text-muted-foreground'>
                  No scenes available. Please add scenes to generate images.
                </p>
              </div>
            )}

            {Object.keys(screenImages).length > 0 && (
              <div>
                <div className='mb-4 flex items-center justify-between'>
                  <Label>Generated Images for Script Screens</Label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setActiveTab('customize')}
                  >
                    Customize Images
                  </Button>
                </div>

                <div className='space-y-4'>
                  {scriptScreens.map(screen => (
                    <Card key={screen.id} className='overflow-hidden'>
                      <div className='flex items-center justify-between bg-muted/30 p-4'>
                        <h3 className='font-medium'>{screen.title}</h3>
                        <div className='flex space-x-1'>
                          {screenImages[screen.id] && (
                            <>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDownloadImage(screen.id)}
                              >
                                <Download className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleRegenerateImage(screen.id)}
                                disabled={isRegenerating === screen.id}
                              >
                                {isRegenerating === screen.id ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <RefreshCw className='h-4 w-4' />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <CardContent className='p-0'>
                        {screenImages[screen.id] ? (
                          <div className='relative'>
                            <Image
                              src={
                                screenImages[screen.id] || '/placeholder.svg'
                              }
                              alt={`Image for ${screen.title}`}
                              className='h-auto w-full'
                              width={500} // Adjust width as needed
                              height={500} // Adjust height as needed
                              layout='responsive'
                            />
                            <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100'>
                              <Button
                                variant='secondary'
                                size='sm'
                                className='mr-2'
                                onClick={() => handleEditImage(screen.id)}
                              >
                                <Edit className='mr-1 h-4 w-4' />
                                Edit
                              </Button>
                              <Button
                                variant='secondary'
                                size='sm'
                                onClick={() => handleRegenerateImage(screen.id)}
                                disabled={isRegenerating === screen.id}
                              >
                                {isRegenerating === screen.id ? (
                                  <Loader2 className='mr-1 h-4 w-4 animate-spin' />
                                ) : (
                                  <RefreshCw className='mr-1 h-4 w-4' />
                                )}
                                Regenerate
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='flex h-48 items-center justify-center bg-muted'>
                            <Button
                              variant='outline'
                              onClick={() => handleRegenerateImage(screen.id)}
                              disabled={isRegenerating === screen.id}
                            >
                              {isRegenerating === screen.id ? (
                                <>
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <ImageIcon className='mr-2 h-4 w-4' />
                                  Generate Image
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                      <div className='border-t p-3'>
                        <p className='text-sm text-muted-foreground'>
                          {screen.narration}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value='customize'>
          <div className='space-y-6'>
            <div>
              <Label className='mb-2 block'>
                Customize Images for Each Screen
              </Label>
              <p className='mb-4 text-sm text-muted-foreground'>
                Select a screen to regenerate its image or edit the existing
                one.
              </p>

              <div className='space-y-4'>
                {scriptScreens.map(screen => (
                  <Card
                    key={screen.id}
                    className={`overflow-hidden ${selectedScreen === screen.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleSelectScreen(screen.id)}
                  >
                    <div className='flex items-center justify-between bg-muted/30 p-4'>
                      <h3 className='font-medium'>{screen.title}</h3>
                      <div className='flex space-x-2'>
                        {screenImages[screen.id] && (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={e => {
                                e.stopPropagation()
                                handleEditImage(screen.id)
                              }}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={e => {
                                e.stopPropagation()
                                handleRegenerateImage(screen.id)
                              }}
                              disabled={isRegenerating === screen.id}
                            >
                              {isRegenerating === screen.id ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                              ) : (
                                <RefreshCw className='h-4 w-4' />
                              )}
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={e => {
                                e.stopPropagation()
                                handleDownloadImage(screen.id)
                              }}
                            >
                              <Download className='h-4 w-4' />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <CardContent className='p-0'>
                      {screenImages[screen.id] ? (
                        <Image
                          src={screenImages[screen.id] || '/placeholder.svg'}
                          alt={`Image for ${screen.title}`}
                          className='h-auto w-full'
                          width={500} // Adjust width as needed
                          height={500} // Adjust height as needed
                          layout='responsive'
                        />
                      ) : (
                        <div className='flex h-48 items-center justify-center bg-muted'>
                          <Button
                            variant='outline'
                            onClick={e => {
                              e.stopPropagation()
                              handleRegenerateImage(screen.id)
                            }}
                            disabled={isRegenerating === screen.id}
                          >
                            {isRegenerating === screen.id ? (
                              <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Generating...
                              </>
                            ) : (
                              <>
                                <ImageIcon className='mr-2 h-4 w-4' />
                                Generate Image
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className='flex justify-between'>
              <Button
                variant='outline'
                onClick={() => setActiveTab('generate')}
              >
                Back to Generate
              </Button>
              <Button
                onClick={() => setActiveTab('video')}
                disabled={!allScreensHaveImages()}
              >
                Continue to Video Creation
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='edit'>
          {currentEditingScreen !== null &&
            screenImages[currentEditingScreen] && (
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-medium'>
                    Editing Image for:{' '}
                    {
                      scriptScreens.find(s => s.id === currentEditingScreen)
                        ?.title
                    }
                  </h3>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setActiveTab('customize')}
                  >
                    Cancel
                  </Button>
                </div>

                <div className='overflow-hidden rounded-md border'>
                  <Image
                    src={
                      screenImages[currentEditingScreen] || '/placeholder.svg'
                    }
                    alt={`Editing ${scriptScreens.find(s => s.id === currentEditingScreen)?.title}`}
                    className='h-auto w-full'
                    width={500} // Adjust width as needed
                    height={500} // Adjust height as needed
                    style={{
                      transform: `scale(${imageScale[0] / 100})`,
                      filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`
                    }}
                    layout='responsive'
                  />
                </div>

                {/* Script Editing Section */}
                <div className='space-y-2'>
                  <Label htmlFor='script-content'>Edit Script Content</Label>
                  <p className='text-sm text-muted-foreground'>
                    Edit the script to regenerate a more accurate image
                  </p>
                  <Textarea
                    id='script-content'
                    value={editingScriptText}
                    onChange={e => setEditingScriptText(e.target.value)}
                    className='min-h-[100px]'
                    placeholder='Describe the scene in detail for better image generation'
                  />
                  <Button
                    onClick={handleRegenerateWithScript}
                    disabled={
                      isRegenerating === currentEditingScreen ||
                      !editingScriptText.trim()
                    }
                    className='w-full'
                  >
                    {isRegenerating === currentEditingScreen ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Regenerating with New Script...
                      </>
                    ) : (
                      <>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Regenerate Image with New Script
                      </>
                    )}
                  </Button>
                </div>

                <div className='mt-4 border-t pt-4'>
                  <h4 className='mb-2 font-medium'>Image Adjustments</h4>
                </div>

                <div className='space-y-4'>
                  <div>
                    <div className='mb-2 flex justify-between'>
                      <Label>Image Scale</Label>
                      <span className='text-sm text-muted-foreground'>
                        {imageScale[0]}%
                      </span>
                    </div>
                    <Slider
                      value={imageScale}
                      onValueChange={setImageScale}
                      min={50}
                      max={150}
                      step={5}
                    />
                    <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
                      <span>
                        <Minimize className='inline h-3 w-3' /> Smaller
                      </span>
                      <span>
                        Larger <Maximize className='inline h-3 w-3' />
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className='mb-2 flex justify-between'>
                      <Label>Brightness</Label>
                      <span className='text-sm text-muted-foreground'>
                        {brightness[0]}%
                      </span>
                    </div>
                    <Slider
                      value={brightness}
                      onValueChange={setBrightness}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className='mb-2 flex justify-between'>
                      <Label>Contrast</Label>
                      <span className='text-sm text-muted-foreground'>
                        {contrast[0]}%
                      </span>
                    </div>
                    <Slider
                      value={contrast}
                      onValueChange={setContrast}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </div>

                  <div>
                    <div className='mb-2 flex justify-between'>
                      <Label>Saturation</Label>
                      <span className='text-sm text-muted-foreground'>
                        {saturation[0]}%
                      </span>
                    </div>
                    <Slider
                      value={saturation}
                      onValueChange={setSaturation}
                      min={0}
                      max={200}
                      step={5}
                    />
                  </div>

                  <div className='flex justify-between pt-4'>
                    <Button
                      variant='outline'
                      onClick={() => {
                        // Reset all adjustments
                        setImageScale([100])
                        setBrightness([100])
                        setContrast([100])
                        setSaturation([100])
                      }}
                    >
                      Reset Adjustments
                    </Button>
                    <Button onClick={handleSaveEdit}>Save Changes</Button>
                  </div>
                </div>
              </div>
            )}
        </TabsContent>

        <TabsContent value='video'>
          <div className='space-y-6'>
            <div>
              <Label>Selected Images for Video</Label>
              <div className='mt-2 grid grid-cols-2 gap-2 md:grid-cols-3'>
                {scriptScreens.map(screen => (
                  <div
                    key={screen.id}
                    className='overflow-hidden rounded-md border'
                  >
                    <div className='truncate bg-muted/30 p-2 text-sm font-medium'>
                      {screen.title}
                    </div>
                    <Image
                      src={screenImages[screen.id] || '/placeholder.svg'}
                      alt={`Image for ${screen.title}`}
                      className='h-auto w-full'
                      width={500} // Adjust width as needed
                      height={500} // Adjust height as needed
                      layout='responsive'
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor='motion-effect'>Motion Effect</Label>
              <Select value={motionEffect} onValueChange={setMotionEffect}>
                <SelectTrigger id='motion-effect' className='w-full'>
                  <SelectValue placeholder='Select motion effect' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pan'>Pan (Ken Burns Effect)</SelectItem>
                  <SelectItem value='zoom'>Zoom In/Out</SelectItem>
                  <SelectItem value='fade'>Fade Transition</SelectItem>
                  <SelectItem value='slide'>Slide Transition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='transition-duration'>
                Transition Duration (seconds)
              </Label>
              <Slider
                id='transition-duration'
                defaultValue={[2]}
                min={0.5}
                max={5}
                step={0.5}
              />
              <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
                <span>0.5s</span>
                <span>5s</span>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Switch id='auto-timing' defaultChecked />
              <Label htmlFor='auto-timing'>
                Automatically adjust timing based on script length
              </Label>
            </div>

            <Button
              onClick={handleCreateVideo}
              disabled={
                isCreatingVideo || videoCreated || !allScreensHaveImages()
              }
              className='w-full'
            >
              {isCreatingVideo ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating Video...
                </>
              ) : videoCreated ? (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Video Created
                </>
              ) : (
                'Create Video'
              )}
            </Button>

            {videoCreated && (
              <div className='rounded-md border p-4'>
                <div className='flex aspect-video items-center justify-center bg-muted'>
                  <div className='text-center'>
                    <ImageIcon className='mx-auto h-12 w-12 text-muted-foreground' />
                    <p className='mt-2 text-muted-foreground'>Video Preview</p>
                  </div>
                </div>
                <div className='mt-4 flex justify-between'>
                  <Button
                    variant='outline'
                    onClick={() => setActiveTab('customize')}
                  >
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Edit Images
                  </Button>
                  <Button>Download Video</Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
