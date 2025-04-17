'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import LiteraryCreator from '@/app/generate/pipeline/literacty-creator'
import VoiceConfiguration from '@/app/generate/pipeline/voice-configuration'
import ImageVideoGenerator from '@/app/generate/pipeline/image-video-generator'
import VideoEditor from '@/app/generate/pipeline/video-editor'
import Publishing from '@/app/generate/pipeline/publishing'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '../dashboard/components/sidebar'
import { DashboardHeader } from '../dashboard/components/header'

const steps = [
  { id: 'literary', label: 'Literary Content' },
  { id: 'voice', label: 'Voice Config' },
  { id: 'images', label: 'Images & Video' },
  { id: 'video-editor', label: 'Video Editor' }
]

export default function GeneratePage() {
  const [activeStep, setActiveStep] = useState('video-editor')
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // Track completion status for each step
  const [literaryComplete, setLiteraryComplete] = useState(false)
  const [voiceComplete, setVoiceComplete] = useState(false)
  const [imagesComplete, setImagesComplete] = useState(false)
  const [editorComplete, setEditorComplete] = useState(false)

  const currentStepIndex = steps.findIndex(step => step.id === activeStep)

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      // Mark current step as completed
      if (!completedSteps.includes(activeStep)) {
        setCompletedSteps([...completedSteps, activeStep])
      }
      // Move to next step
      setActiveStep(steps[currentStepIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setActiveStep(steps[currentStepIndex - 1].id)
    }
  }

  // Check if the current step is complete
  const isCurrentStepComplete = () => {
    switch (activeStep) {
      case 'literary':
        return literaryComplete
      case 'voice':
        return voiceComplete
      case 'images':
        return imagesComplete
      case 'video-editor':
        return editorComplete
      default:
        return false
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className='flex h-screen w-full overflow-hidden bg-background'>
        <DashboardSidebar />
        <div className='flex flex-1 flex-col overflow-hidden'>
          {/* <DashboardHeader />  */}
          <div className='flex-1 overflow-auto p-4 md:p-6'>
            <h1 className='mb-8 text-3xl font-bold'>Create AI Video</h1>

            <div className='mb-8'>
              <div className='mb-4 flex items-center justify-between'>
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className='mx-auto flex flex-col items-center'
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                        activeStep === step.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : completedSteps.includes(step.id)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground text-muted-foreground'
                      }`}
                    >
                      {completedSteps.includes(step.id) ? (
                        <Check className='h-5 w-5' />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className='mt-2 hidden text-xs md:block'>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className='relative'>
                <div className='absolute left-0 right-0 top-0 h-1 bg-muted-foreground/20'></div>
                <div
                  className='absolute left-0 top-0 h-1 bg-primary transition-all duration-300'
                  style={{
                    width: `${((currentStepIndex + 1) / steps.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            <Card className='space-y-6 p-4 md:p-6'>
              <Tabs value={activeStep} className='w-full'>
                <TabsContent value='literary'>
                  <LiteraryCreator
                    onComplete={() => setLiteraryComplete(true)}
                  />
                </TabsContent>
                <TabsContent value='voice'>
                  <VoiceConfiguration
                    onComplete={() => setVoiceComplete(true)}
                  />
                </TabsContent>
                <TabsContent value='images'>
                  <ImageVideoGenerator
                    onComplete={() => setImagesComplete(true)}
                  />
                </TabsContent>
                <TabsContent value='video-editor'>
                  <VideoEditor onComplete={() => setEditorComplete(true)} />
                </TabsContent>
              </Tabs>

              <div className='mt-8 flex justify-between'>
                {/* <Button
                  variant='outline'
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                >
                  <ArrowLeft className='mr-2 h-4 w-4' /> Previous
                </Button> */}

                {/* {activeStep !== 'literary' ? (
                  <Button
                    variant='outline'
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft className='mr-2 h-4 w-4' /> Previous
                  </Button>
                ) : (
                  <div></div>
                )} */}
                <div> </div>

                {activeStep !== 'video-editor' ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isCurrentStepComplete()}
                  >
                    Next <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                ) : (
                  <Button disabled={!editorComplete}>Finish</Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
