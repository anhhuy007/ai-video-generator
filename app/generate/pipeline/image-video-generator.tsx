'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Check,
  ImageIcon,
  Loader2,
  RefreshCw,
  Edit,
  Maximize,
  Minimize,
  Download
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import axios from 'axios'
import { useGenerationStore } from '@/store/useGenerationStore'
import { Character, Scene } from '@/app/utils/type'

const IMAGE_STYLES = [
  {
    id: 'sketch',
    name: 'Sketch',
    image: '/samples/sketch.jpg?height=100&width=200&text=Sketch+Style'
  },
  {
    id: 'classic',
    name: 'Classic',
    image: '/samples/classic.jpg?height=100&width=200&text=Classic+Style'
  },
  {
    id: 'modern',
    name: 'Modern',
    image: '/samples/modern.jpg?height=100&width=200&text=Modern+Style'
  },
  {
    id: 'abstract',
    name: 'Abstract',
    image: '/samples/abstract.jpg?height=100&width=200&text=Abstract+Style'
  },
  {
    id: 'realistic',
    name: 'Realistic',
    image: '/samples/realistic.jpg?height=100&width=200&text=Realistic+Style'
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    image: '/samples/cartoon.jpg?height=100&width=200&text=Cartoon+Style'
  }
]

export default function ImageVideoGenerator({
  onComplete
}: {
  onComplete: () => void
}) {
  const [activeTab, setActiveTab] = useState('generate')
  const [imageStyle, setImageStyle] = useState('sketch')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState<number | null>(null)
  const [imageCreated, setImageCreated] = useState(false)
  const [isImageGenerateComplete, setIsImageGenerateComplete] = useState(false)

  const { story, setImages } = useGenerationStore()
  const [isUploading, setIsUploading] = useState(false)

  // Screen-based image generation
  const [scriptScreens, setScriptScreens] = useState(story.scenes)
  const [screenImages, setScreenImages] = useState<{
    [screenId: number]: string
  }>({})
  const [currentEditingScreen, setCurrentEditingScreen] = useState<
    number | null
  >(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogScreen, setDialogScreen] = useState<number | null>(null)

  // Add a new state for editing script text
  const [editingScriptText, setEditingScriptText] = useState<string>('')
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Approve Images and push on Cloudinary
  const [imagesApproved, setImagesApproved] = useState(false)

  // Update completion status when all screens have images and video is created
  useEffect(() => {
    if (isImageGenerateComplete) {
      onComplete()
    }
  }, [isImageGenerateComplete, onComplete])

  // Handle improve images and push all images to cloudinary
  const handleApproveImages = async () => {
    if (imageCreated && !isUploading) {
      setIsUploading(true)

      try {
        const base64List = Object.values(screenImages)
        const uploadedImageUrls = await uploadAllImagesToCloudinary(base64List)
        setImages(uploadedImageUrls)
        setImagesApproved(true)
        setIsImageGenerateComplete(true)
      } catch (error) {
        console.error('Error uploading images:', error)
      } finally {
        setIsUploading(false)
      }
    }
  }
  const uploadAllImagesToCloudinary = async (
    base64Images: string[]
  ): Promise<string[]> => {
    const results = await Promise.all(
      (base64Images || []).map(base64Image =>
        uploadImageToCloudinary(base64Image)
      )
    )
    return results
  }
  const uploadImageToCloudinary = async (
    base64Image: string
  ): Promise<string> => {
    const response = await axios.post('/api/upload/image', {
      base64Image
    })

    if (!response.data.url) {
      throw new Error(
        'Cannot upload image to cloudinary. Please try again later'
      )
    }
    return response.data.url
  }

  // Check if all screens have images
  const allScreensHaveImages = () => {
    return (
      scriptScreens.length > 0 &&
      scriptScreens.every(screen => screenImages[screen.id])
    )
  }

  const handleOpenDialog = (screenId: number) => {
    setDialogScreen(screenId)
    setDialogOpen(true)
  }

  const generateImagePrompt = (screen: Scene, style: string) => {
    return `Generate a ${style} image of the scene: ${screen.image}`
  }

  const generateAllImages = async (
    scenes: Scene[],
    characters: Character[],
    imageType: string
  ) => {
    if (!scenes || !characters || !imageType) {
      throw new Error('Lack of information. Please go back to previous step')
    }

    const response = await axios.post('/api/generation/images', {
      scenes,
      characters,
      imageType
    })

    const scenesWithImages = response.data.scenes || []
    const generatedImages = scenesWithImages.reduce(
      (acc: any, screen: Scene) => {
        acc[screen.id] = screen.image || null
        return acc
      },
      {}
    )

    if (!generatedImages) {
      throw new Error('No images returned from API')
    }

    return generatedImages
  }

  const handleGenerateAllImages = async () => {
    console.log('Generating images for all screens...')
    setIsGenerating(true)
    setGenerationError(null)

    try {
      const generatedImages = await generateAllImages(
        scriptScreens,
        story.characters,
        imageStyle
      )

      setScreenImages(prev => ({
        ...prev,
        ...generatedImages
      }))

      setActiveTab('customize')
      setImageCreated(true)

      console.log(generatedImages)
    } catch (error) {
      console.error('Error generating images:', error)
      setGenerationError(
        'Failed to generate one or more images. Please try again.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateImage = async (
    prompt: string,
    characters: Character[],
    imageType: string
  ) => {
    const response = await axios.post('api/generation/image', {
      prompt,
      characters,
      imageType
    })

    const image = response.data.image
    if (!image) {
      throw new Error('NO image returned from API')
    }

    return image
  }

  const handleRegenerateImage = async (screenId: number) => {
    setImageCreated(false)
    setIsRegenerating(screenId)
    setGenerationError(null)

    try {
      const screen = scriptScreens.find(s => s.id === screenId)
      if (!screen) {
        throw new Error('Screen is null, cannot generate prompt')
      }
      const prompt = generateImagePrompt(screen, imageStyle)

      const image = await regenerateImage(prompt, story.characters, imageStyle)

      if (image) {
        setScreenImages(prev => ({
          ...prev,
          [screenId]: image
        }))

        setActiveTab('customize')
        setImageCreated(true)
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

  const handleEditImage = (screenId: number) => {
    setCurrentEditingScreen(screenId)
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
      const image = await regenerateImage(prompt, story.characters, imageStyle)

      if (image) {
        setScreenImages(prev => ({
          ...prev,
          [currentEditingScreen]: image
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
    setActiveTab('customize')
    setCurrentEditingScreen(null)
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
    <div className='space-y-6 p-4 md:p-6'>
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
        <TabsList className='mb-6 grid w-full grid-cols-3'>
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
        </TabsList>

        <TabsContent value='generate'>
          <div className='space-y-6'>
            <div>
              <Label className='mb-3 block'>Select Image Style</Label>
              <div className='grid grid-cols-2 gap-10 md:grid-cols-3'>
                {IMAGE_STYLES.map(style => (
                  <div
                    key={style.id}
                    className={`cursor-pointer overflow-hidden rounded-md border transition-all hover:shadow-md ${
                      imageStyle === style.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setImageStyle(style.id)}
                  >
                    <img
                      src={style.image || '/placeholder.jpg'}
                      alt={`${style.name} style example`}
                      className='h-auto w-full border'
                      width={500}
                      height={500}
                    />
                    <div className='flex items-center justify-between p-2'>
                      <span className='mx-auto font-medium'>{style.name}</span>
                      {imageStyle === style.id && (
                        <Check className='h-4 w-4 text-primary' />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateAllImages}
              disabled={isGenerating}
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
          </div>
        </TabsContent>

        <TabsContent value='customize'>
          <div className='space-y-6'>
            <div>
              <Label className='mb-2 block'>
                Customize Images for Each Screen
              </Label>
              <p className='mb-4 text-sm text-muted-foreground'>
                Click on a screen to view details, or use the edit button to
                modify the image.
              </p>

              <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                {scriptScreens.map(screen => (
                  <div
                    key={screen.id}
                    className='cursor-pointer overflow-hidden rounded-md border transition-all hover:shadow-md'
                    onClick={() => handleOpenDialog(screen.id)}
                  >
                    <div className='flex items-center justify-between truncate bg-muted/30 p-2 text-sm font-medium'>
                      <span>{screen.title}</span>
                      <div
                        className='flex space-x-1'
                        onClick={e => e.stopPropagation()}
                      >
                        {screenImages[screen.id] && (
                          <>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6'
                              onClick={e => {
                                e.stopPropagation()
                                handleEditImage(screen.id)
                              }}
                            >
                              <Edit className='h-3 w-3' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6'
                              onClick={e => {
                                e.stopPropagation()
                                handleRegenerateImage(screen.id)
                              }}
                              disabled={isRegenerating === screen.id}
                            >
                              {isRegenerating === screen.id ? (
                                <Loader2 className='h-3 w-3 animate-spin' />
                              ) : (
                                <RefreshCw className='h-3 w-3' />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {screenImages[screen.id] ? (
                      <img
                        src={screenImages[screen.id] || '/placeholder.svg'}
                        alt={`Image for ${screen.title}`}
                        className='h-auto w-full'
                        height={500}
                        width={500}
                      />
                    ) : (
                      <div className='flex h-40 items-center justify-center bg-muted'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={e => {
                            e.stopPropagation()
                            handleRegenerateImage(screen.id)
                          }}
                          disabled={isRegenerating === screen.id}
                        >
                          {isRegenerating === screen.id ? (
                            <>
                              <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                              Generating...
                            </>
                          ) : (
                            <>
                              <ImageIcon className='mr-2 h-3 w-3' />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className='mt-6'>
              {imagesApproved && !isUploading ? (
                <div className='rounded-md border border-green-500 bg-green-50 p-4'>
                  <div className='mb-2 flex items-center text-green-700'>
                    <Check className='mr-2 h-5 w-5 animate-pulse' />
                    <h3 className='font-medium'>Images Approved & Uploaded!</h3>
                  </div>
                  <p className='text-sm text-green-600'>
                    All images have been approved and pushed to Cloudinary. Now
                    you can create the video.
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleApproveImages}
                  disabled={!allScreensHaveImages() || isUploading}
                  className='w-full'
                >
                  {isUploading ? (
                    <span className='flex items-center'>
                      <span className='mr-2 animate-spin'>◯</span>
                      Uploading...
                    </span>
                  ) : (
                    'Approve and Upload Images'
                  )}
                </Button>
              )}
            </div>

            <div className='flex justify-between'>
              <Button
                variant='outline'
                onClick={() => setActiveTab('generate')}
              >
                Back to Generate
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

                <div className='flex justify-center overflow-hidden rounded-md'>
                  <img
                    src={
                      screenImages[currentEditingScreen] || '/placeholder.svg'
                    }
                    alt={`Editing ${scriptScreens.find(s => s.id === currentEditingScreen)?.title}`}
                    className='max-h-[200px] max-w-full object-contain'
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

                <div className='mt-4 flex justify-end'>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isRegenerating == dialogScreen}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-3xl'>
          {dialogScreen !== null && (
            <>
              <DialogHeader>
                <DialogTitle className='text-xl'>
                  {scriptScreens.find(s => s.id === dialogScreen)?.title}
                </DialogTitle>
                <DialogDescription>
                  {scriptScreens.find(s => s.id === dialogScreen)?.description}
                </DialogDescription>
              </DialogHeader>

              <div className='mt-4 overflow-hidden rounded-md border'>
                {screenImages[dialogScreen] ? (
                  <img
                    src={screenImages[dialogScreen] || '/placeholder.svg'}
                    alt={`Full view of ${scriptScreens.find(s => s.id === dialogScreen)?.title}`}
                    className='h-auto w-full'
                  />
                ) : (
                  <div className='flex h-64 items-center justify-center bg-muted'>
                    <p className='text-muted-foreground'>
                      No image generated yet
                    </p>
                  </div>
                )}
              </div>

              <div className='mt-4 flex justify-between'>
                <Button
                  variant='outline'
                  onClick={() => handleRegenerateImage(dialogScreen)}
                  disabled={isRegenerating === dialogScreen}
                >
                  {isRegenerating === dialogScreen ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      Regenerate Image
                    </>
                  )}
                </Button>
                <Button onClick={() => handleEditImage(dialogScreen)}>
                  <Edit className='mr-2 h-4 w-4' />
                  Edit Image & Script
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
