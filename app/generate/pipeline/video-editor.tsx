'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Check, Music, Plus, Subtitles, Video } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export default function VideoEditor({
  onComplete
}: {
  onComplete: () => void
}) {
  const [activeTab, setActiveTab] = useState('timeline')
  const [autoSubtitles, setAutoSubtitles] = useState(true)
  const [backgroundMusic, setBackgroundMusic] = useState(true)
  const [musicVolume, setMusicVolume] = useState([70])
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const [isEditorComplete, setIsEditorComplete] = useState(false)

  const handlePreview = () => {
    setIsPreviewReady(true)
  }

  const handleComplete = () => {
    setIsEditorComplete(true)
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  return (
    <div>
      <h2 className='mb-4 text-2xl font-bold'>Advanced Video Editor</h2>
      <p className='mb-6 text-muted-foreground'>
        Edit your video, add effects, music, and subtitles before publishing.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-3'>
          <TabsTrigger value='timeline'>Timeline</TabsTrigger>
          <TabsTrigger value='effects'>Effects & Audio</TabsTrigger>
          <TabsTrigger value='preview'>Preview</TabsTrigger>
        </TabsList>

        <TabsContent value='timeline'>
          <div className='space-y-6'>
            <div className='rounded-md border p-4'>
              <Label className='mb-2 block'>Video Timeline</Label>
              <div className='relative h-24 rounded-md bg-muted'>
                {/* Timeline clips */}
                <div className='absolute left-2 right-2 top-2 flex h-12 space-x-1'>
                  <div className='flex h-full w-1/4 items-center justify-center rounded-sm bg-primary/80 text-xs text-primary-foreground'>
                    Intro
                  </div>
                  <div className='flex h-full w-2/5 items-center justify-center rounded-sm bg-primary/60 text-xs text-primary-foreground'>
                    Main Content
                  </div>
                  <div className='flex h-full w-1/5 items-center justify-center rounded-sm bg-primary/40 text-xs text-primary-foreground'>
                    Visuals
                  </div>
                  <div className='flex h-full w-1/6 items-center justify-center rounded-sm bg-primary/80 text-xs text-primary-foreground'>
                    Outro
                  </div>
                </div>

                {/* Timeline ruler */}
                <div className='absolute bottom-2 left-2 right-2 flex h-4'>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className='h-full flex-1 border-l border-muted-foreground/30'
                    >
                      <div className='text-[10px] text-muted-foreground'>
                        {i * 30}s
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Card>
                <CardContent className='p-4'>
                  <div className='mb-2 flex items-center justify-between'>
                    <Label>Available Clips</Label>
                    <Button variant='outline' size='sm'>
                      <Plus className='mr-1 h-4 w-4' /> Add Clip
                    </Button>
                  </div>
                  <div className='max-h-40 space-y-2 overflow-y-auto'>
                    {[
                      'Intro Sequence',
                      'Main Content',
                      'Visual Segment',
                      'Conclusion'
                    ].map((clip, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between rounded-md bg-muted/50 p-2'
                      >
                        <div className='flex items-center'>
                          <Video className='mr-2 h-4 w-4 text-muted-foreground' />
                          <span className='text-sm'>{clip}</span>
                        </div>
                        <Button variant='ghost' size='sm'>
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-4'>
                  <div className='mb-2 flex items-center justify-between'>
                    <Label>Transitions</Label>
                  </div>
                  <div className='max-h-40 space-y-2 overflow-y-auto'>
                    {['Fade', 'Dissolve', 'Wipe', 'Slide', 'Zoom'].map(
                      (transition, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between rounded-md bg-muted/50 p-2'
                        >
                          <span className='text-sm'>{transition}</span>
                          <Button variant='ghost' size='sm'>
                            Apply
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button onClick={() => setActiveTab('effects')} className='w-full'>
              Continue to Effects & Audio
            </Button>
          </div>
        </TabsContent>

        <TabsContent value='effects'>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <Label className='mb-2 block'>Subtitles</Label>
                <Card>
                  <CardContent className='p-4'>
                    <div className='mb-4 flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <Subtitles className='h-4 w-4 text-muted-foreground' />
                        <span>Auto-generate subtitles</span>
                      </div>
                      <Switch
                        checked={autoSubtitles}
                        onCheckedChange={setAutoSubtitles}
                      />
                    </div>

                    {autoSubtitles && (
                      <div className='space-y-2'>
                        <div>
                          <Label className='text-xs'>Subtitle Style</Label>
                          <div className='mt-1 grid grid-cols-3 gap-2'>
                            <div className='cursor-pointer rounded-md border border-primary bg-primary/10 p-2 text-center text-xs'>
                              Standard
                            </div>
                            <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                              Minimal
                            </div>
                            <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                              Bold
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className='text-xs'>Position</Label>
                          <div className='mt-1 grid grid-cols-3 gap-2'>
                            <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                              Top
                            </div>
                            <div className='cursor-pointer rounded-md border border-primary bg-primary/10 p-2 text-center text-xs'>
                              Bottom
                            </div>
                            <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                              Floating
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Label className='mb-2 block'>Background Music</Label>
                <Card>
                  <CardContent className='p-4'>
                    <div className='mb-4 flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <Music className='h-4 w-4 text-muted-foreground' />
                        <span>Add background music</span>
                      </div>
                      <Switch
                        checked={backgroundMusic}
                        onCheckedChange={setBackgroundMusic}
                      />
                    </div>

                    {backgroundMusic && (
                      <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='cursor-pointer rounded-md border border-primary bg-primary/10 p-2 text-center text-xs'>
                            Upbeat
                          </div>
                          <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                            Relaxing
                          </div>
                          <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                            Dramatic
                          </div>
                          <div className='cursor-pointer rounded-md border p-2 text-center text-xs'>
                            Corporate
                          </div>
                        </div>

                        <div>
                          <div className='mb-1 flex justify-between'>
                            <Label className='text-xs'>Volume</Label>
                            <span className='text-xs text-muted-foreground'>
                              {musicVolume[0]}%
                            </span>
                          </div>
                          <Slider
                            value={musicVolume}
                            onValueChange={setMusicVolume}
                            min={0}
                            max={100}
                            step={5}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <Label className='mb-2 block'>Animations & Effects</Label>
              <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
                {[
                  'Fade In/Out',
                  'Text Animation',
                  'Zoom Effect',
                  'Color Grading',
                  'Blur Background',
                  'Picture-in-Picture',
                  'Split Screen',
                  'Slow Motion'
                ].map((effect, index) => (
                  <div
                    key={index}
                    className='cursor-pointer rounded-md border p-2 text-center text-sm hover:bg-muted/50'
                  >
                    {effect}
                  </div>
                ))}
              </div>
            </div>

            <div className='flex justify-between'>
              <Button
                variant='outline'
                onClick={() => setActiveTab('timeline')}
              >
                Back to Timeline
              </Button>
              <Button onClick={() => setActiveTab('preview')}>
                Continue to Preview
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='preview'>
          <div className='space-y-6'>
            <div className='overflow-hidden rounded-md border'>
              <div className='flex aspect-video items-center justify-center bg-muted'>
                <div className='text-center'>
                  <Video className='mx-auto h-12 w-12 text-muted-foreground' />
                  <p className='mt-2 text-muted-foreground'>Video Preview</p>
                  {!isPreviewReady && (
                    <Button
                      variant='outline'
                      size='sm'
                      className='mt-4'
                      onClick={handlePreview}
                    >
                      Generate Preview
                    </Button>
                  )}
                </div>
              </div>

              {isPreviewReady && (
                <div className='flex items-center justify-between bg-muted/30 p-4'>
                  <div className='flex items-center space-x-4'>
                    <Button size='sm' variant='outline'>
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
                        className='h-4 w-4'
                      >
                        <polygon points='5 3 19 12 5 21 5 3'></polygon>
                      </svg>
                    </Button>
                    <div className='h-1 w-48 rounded-full bg-muted-foreground/30'>
                      <div className='h-1 w-1/3 rounded-full bg-primary'></div>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      01:23 / 04:56
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button size='sm' variant='outline'>
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
                        className='h-4 w-4'
                      >
                        <polygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5'></polygon>
                        <path d='M15.54 8.46a5 5 0 0 1 0 7.07'></path>
                        <path d='M19.07 4.93a10 10 0 0 1 0 14.14'></path>
                      </svg>
                    </Button>
                    <Button size='sm' variant='outline'>
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
                        className='h-4 w-4'
                      >
                        <rect
                          x='2'
                          y='2'
                          width='20'
                          height='20'
                          rx='5'
                          ry='5'
                        ></rect>
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className='flex justify-between'>
              <Button variant='outline' onClick={() => setActiveTab('effects')}>
                Back to Effects
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!isPreviewReady || isEditorComplete}
              >
                {isEditorComplete ? (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    Video Editing Complete
                  </>
                ) : (
                  'Finalize Video'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
