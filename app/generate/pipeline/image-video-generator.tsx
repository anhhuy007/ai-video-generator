'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Check,
  ImageIcon,
  Loader2,
  RefreshCw,
  Edit,
  Maximize,
  Minimize
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

// Updated image styles with visual representations
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

// Mock script screens from the Literary Creator
const MOCK_SCRIPT_SCREENS = [
  {
    id: 1,
    title: 'Introduction',
    content:
      'Introducing the concept of artificial intelligence and its evolution.'
  },
  {
    id: 2,
    title: 'Historical Context',
    content:
      'The history of AI from early computing to modern machine learning.'
  },
  {
    id: 3,
    title: 'Current Applications',
    content: 'How AI is used today in various industries and everyday life.'
  },
  {
    id: 4,
    title: 'Future Possibilities',
    content: 'The potential future developments and impacts of AI technology.'
  },
  {
    id: 5,
    title: 'Ethical Considerations',
    content: 'Exploring the ethical questions surrounding AI development.'
  },
  {
    id: 6,
    title: 'Conclusion',
    content: "Summarizing the key points about AI's role in our future."
  }
]

export default function ImageVideoGenerator({
  onComplete
}: {
  onComplete: () => void
}) {
  const [activeTab, setActiveTab] = useState('generate')
  const [imageStyle, setImageStyle] = useState('classic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState<number | null>(null)
  const [isImageSelected, setIsImageSelected] = useState(false)
  const [motionEffect, setMotionEffect] = useState('pan')
  const [isCreatingVideo, setIsCreatingVideo] = useState(false)
  const [videoCreated, setVideoCreated] = useState(false)

  // Screen-based image generation
  const [scriptScreens, setScriptScreens] = useState(MOCK_SCRIPT_SCREENS)
  const [screenImages, setScreenImages] = useState<{ [key: number]: string }>(
    {}
  )
  const [selectedScreen, setSelectedScreen] = useState<number | null>(null)
  const [currentEditingScreen, setCurrentEditingScreen] = useState<
    number | null
  >(null)

  // Dialog state for viewing full image
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogScreen, setDialogScreen] = useState<number | null>(null)

  // Image editing states
  const [imageScale, setImageScale] = useState([100])
  const [brightness, setBrightness] = useState([100])
  const [contrast, setContrast] = useState([100])
  const [saturation, setSaturation] = useState([100])

  // Add a new state for editing script text
  const [editingScriptText, setEditingScriptText] = useState<string>('')

  // Update completion status when all screens have images and video is created
  useEffect(() => {
    if (isImageSelected) {
      onComplete()
    }
  }, [isImageSelected, onComplete])

  // Check if all screens have images
  const allScreensHaveImages = () => {
    return scriptScreens.every(screen => screenImages[screen.id])
  }

  const handleGenerateAllImages = () => {
    setIsGenerating(true)

    // Simulate API call to generate images for all screens
    setTimeout(() => {
      const newImages: { [key: number]: string } = {}

      scriptScreens.forEach(screen => {
        newImages[screen.id] =
          `/placeholder.jpg?height=400&width=700&text=${encodeURIComponent(screen.title)}`
      })

      setScreenImages(newImages)
      setIsGenerating(false)
      setIsImageSelected(true)
      setActiveTab('customize')
    }, 3000)
  }

  const handleRegenerateImage = (screenId: number) => {
    setIsRegenerating(screenId)

    // Simulate API call to regenerate a specific image
    setTimeout(() => {
      setScreenImages(prev => ({
        ...prev,
        [screenId]: `/placeholder.jpg?height=400&width=700&text=${encodeURIComponent(scriptScreens.find(s => s.id === screenId)?.title || '')}&v=${Math.random()}`
      }))
      setIsRegenerating(null)
    }, 2000)
  }

  const handleSelectScreen = (screenId: number) => {
    setSelectedScreen(screenId === selectedScreen ? null : screenId)
  }

  // Function to open dialog with screen details
  const handleOpenDialog = (screenId: number) => {
    setDialogScreen(screenId)
    setDialogOpen(true)
  }

  // Update the handleEditImage function to also set the script text
  const handleEditImage = (screenId: number) => {
    setCurrentEditingScreen(screenId)
    // Set the current script text for editing
    const screen = scriptScreens.find(s => s.id === screenId)
    if (screen) {
      setEditingScriptText(screen.content)
    }
    setActiveTab('edit')
  }

  // Add a function to handle script regeneration
  const handleRegenerateWithScript = () => {
    if (currentEditingScreen === null) return

    // Update the script content
    setScriptScreens(prev =>
      prev.map(screen =>
        screen.id === currentEditingScreen
          ? { ...screen, content: editingScriptText }
          : screen
      )
    )

    // Regenerate the image
    setIsRegenerating(currentEditingScreen)

    // Simulate API call to regenerate based on new script
    setTimeout(() => {
      setScreenImages(prev => ({
        ...prev,
        [currentEditingScreen]: `/placeholder.jpg?height=400&width=700&text=${encodeURIComponent(editingScriptText.substring(0, 20))}&v=${Math.random()}`
      }))
      setIsRegenerating(null)
    }, 2000)
  }

  const handleSaveEdit = () => {
    // In a real implementation, this would apply the edits to the image
    // For now, we'll just simulate a change by adding a random parameter to the URL
    if (currentEditingScreen) {
      setScreenImages(prev => ({
        ...prev,
        [currentEditingScreen]:
          prev[currentEditingScreen] + `&edited=true&t=${Date.now()}`
      }))
    }
    setActiveTab('customize')
    setCurrentEditingScreen(null)
  }

  // const handleCreateVideo = () => {
  //   if (!allScreensHaveImages()) return

  //   setIsCreatingVideo(true)

  //   // Simulate video creation
  //   setTimeout(() => {
  //     setIsCreatingVideo(false)
  //     setVideoCreated(true)
  //   }, 4000)
  // }

  return (
    <div className='space-y-6 p-4 md:p-6'>
      <h2 className='mb-4 text-2xl font-bold'>AI Image & Video Generator</h2>
      <p className='mb-6 text-muted-foreground'>
        Generate images for each screen in your script, customize them, and
        create a video.
      </p>

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
          {/* <TabsTrigger value='video' disabled={!allScreensHaveImages()}>
            Create Video
          </TabsTrigger> */}
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
                        src={screenImages[screen.id] || '/placeholder.jpg'}
                        alt={`Image for ${screen.title}`}
                        className='h-auto w-full'
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

            {/* <div className='flex justify-between'>
              <Button
                variant='outline'
                onClick={() => setActiveTab('generate')}
              >
                Back to Generate
              </Button>
            </div> */}
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
                  <img
                    src={
                      screenImages[currentEditingScreen] || '/placeholder.jpg'
                    }
                    alt={`Editing ${scriptScreens.find(s => s.id === currentEditingScreen)?.title}`}
                    className='h-auto w-full'
                    style={{
                      transform: `scale(${imageScale[0] / 100})`,
                      filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`
                    }}
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

        {/* <TabsContent value='video'>
          <div className='space-y-6'>
            <div>
              <Label>Selected Images for Video</Label>
              <div className='mt-2 grid grid-cols-2 gap-4 md:grid-cols-3'>
                {scriptScreens.map(screen => (
                  <div
                    key={screen.id}
                    className='cursor-pointer overflow-hidden rounded-md border transition-all hover:shadow-md'
                    onClick={() => handleOpenDialog(screen.id)}
                  >
                    <div className='truncate bg-muted/30 p-2 text-sm font-medium'>
                      {screen.title}
                    </div>
                    <img
                      src={screenImages[screen.id] || '/placeholder.jpg'}
                      alt={`Image for ${screen.title}`}
                      className='h-auto w-full'
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
              </div>
            )}
          </div>
        </TabsContent> */}
      </Tabs>

      {/* Dialog for viewing full image and content */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-3xl'>
          {dialogScreen !== null && (
            <>
              <DialogHeader>
                <DialogTitle className='text-xl'>
                  {scriptScreens.find(s => s.id === dialogScreen)?.title}
                </DialogTitle>
                <DialogDescription>
                  {scriptScreens.find(s => s.id === dialogScreen)?.content}
                </DialogDescription>
              </DialogHeader>

              <div className='mt-4 overflow-hidden rounded-md border'>
                {screenImages[dialogScreen] ? (
                  <img
                    src={screenImages[dialogScreen] || '/placeholder.jpg'}
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
