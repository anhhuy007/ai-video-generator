'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Check, ImageIcon, Loader2, RefreshCw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const IMAGE_STYLES = [
  { id: 'sketch', name: 'Sketch' },
  { id: 'classic', name: 'Classic' },
  { id: 'modern', name: 'Modern' },
  { id: 'abstract', name: 'Abstract' },
  { id: 'realistic', name: 'Realistic' },
  { id: 'cartoon', name: 'Cartoon' }
]

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square (1:1)' },
  { id: '4:3', name: 'Standard (4:3)' },
  { id: '16:9', name: 'Widescreen (16:9)' },
  { id: '9:16', name: 'Vertical (9:16)' }
]

export default function ImageVideoGenerator({
  onComplete
}: {
  onComplete: () => void
}) {
  const [activeTab, setActiveTab] = useState('generate')
  const [imageStyle, setImageStyle] = useState('classic')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [colorIntensity, setColorIntensity] = useState([7])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [motionEffect, setMotionEffect] = useState('pan')
  const [isCreatingVideo, setIsCreatingVideo] = useState(false)
  const [videoCreated, setVideoCreated] = useState(false)

  const handleGenerateImages = () => {
    setIsGenerating(true)

    // Simulate AI image generation
    setTimeout(() => {
      const newImages = [
        `/placeholder.svg?height=400&width=${aspectRatio === '1:1' ? 400 : aspectRatio === '9:16' ? 225 : 711}`,
        `/placeholder.svg?height=400&width=${aspectRatio === '1:1' ? 400 : aspectRatio === '9:16' ? 225 : 711}`,
        `/placeholder.svg?height=400&width=${aspectRatio === '1:1' ? 400 : aspectRatio === '9:16' ? 225 : 711}`,
        `/placeholder.svg?height=400&width=${aspectRatio === '1:1' ? 400 : aspectRatio === '9:16' ? 225 : 711}`
      ]
      setGeneratedImages(newImages)
      setIsGenerating(false)
    }, 3000)
  }

  const handleImageSelect = (image: string) => {
    if (selectedImages.includes(image)) {
      setSelectedImages(selectedImages.filter(img => img !== image))
    } else {
      setSelectedImages([...selectedImages, image])
    }
  }

  const handleCreateVideo = () => {
    if (selectedImages.length === 0) return

    setIsCreatingVideo(true)

    // Simulate video creation
    setTimeout(() => {
      setIsCreatingVideo(false)
      setVideoCreated(true)
    }, 4000)
  }

  const handleComplete = () => {
    onComplete()
  }

  return (
    <div>
      <h2 className='mb-4 text-2xl font-bold'>AI Image & Video Generator</h2>
      <p className='mb-6 text-muted-foreground'>
        Generate images, customize them, and create videos with motion effects.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-3'>
          <TabsTrigger value='generate'>Generate Images</TabsTrigger>
          <TabsTrigger
            value='customize'
            disabled={generatedImages.length === 0}
          >
            Customize
          </TabsTrigger>
          <TabsTrigger value='video' disabled={selectedImages.length === 0}>
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
                className='mt-2 grid grid-cols-2 gap-3 md:grid-cols-3'
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

            <div>
              <div className='mb-2 flex justify-between'>
                <Label>Color Intensity</Label>
                <span className='text-sm text-muted-foreground'>
                  {colorIntensity[0]}/10
                </span>
              </div>
              <Slider
                value={colorIntensity}
                onValueChange={setColorIntensity}
                min={1}
                max={10}
                step={1}
              />
              <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
                <span>Muted</span>
                <span>Vibrant</span>
              </div>
            </div>

            <Button
              onClick={handleGenerateImages}
              disabled={isGenerating}
              className='w-full'
            >
              {isGenerating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Generating Images...
                </>
              ) : (
                'Generate Images'
              )}
            </Button>

            {generatedImages.length > 0 && (
              <div>
                <div className='mb-2 flex items-center justify-between'>
                  <Label>Generated Images</Label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setActiveTab('customize')}
                  >
                    Customize Images
                  </Button>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  {generatedImages.map((image, index) => (
                    <div key={index} className='relative'>
                      <img
                        src={image || '/placeholder.svg'}
                        alt={`Generated image ${index + 1}`}
                        className='h-auto w-full rounded-md'
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value='customize'>
          <div className='space-y-6'>
            <div>
              <Label>Select Images for Video</Label>
              <p className='mb-2 text-sm text-muted-foreground'>
                Click on images to select them for your video
              </p>
              <div className='grid grid-cols-2 gap-4'>
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer overflow-hidden rounded-md border-2 ${
                      selectedImages.includes(image)
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                    onClick={() => handleImageSelect(image)}
                  >
                    <img
                      src={image || '/placeholder.svg'}
                      alt={`Generated image ${index + 1}`}
                      className='h-auto w-full'
                    />
                    {selectedImages.includes(image) && (
                      <div className='absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground'>
                        <Check className='h-4 w-4' />
                      </div>
                    )}
                  </div>
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
                disabled={selectedImages.length === 0}
              >
                Continue to Video Creation
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='video'>
          <div className='space-y-6'>
            <div>
              <Label>Selected Images ({selectedImages.length})</Label>
              <div className='mt-2 grid grid-cols-4 gap-2'>
                {selectedImages.map((image, index) => (
                  <img
                    key={index}
                    src={image || '/placeholder.svg'}
                    alt={`Selected image ${index + 1}`}
                    className='h-auto w-full rounded-md'
                  />
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

            <Button
              onClick={handleCreateVideo}
              disabled={isCreatingVideo || videoCreated}
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
                    Recreate
                  </Button>
                  <Button onClick={handleComplete}>
                    Continue to Video Editor
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
