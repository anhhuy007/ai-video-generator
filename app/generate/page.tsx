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

const steps = [
  { id: 'literary', label: 'Literary Content' },
  { id: 'voice', label: 'Voice Config' },
  { id: 'images', label: 'Images & Video' },
  { id: 'editor', label: 'Video Editor' },
  { id: 'publish', label: 'Publishing' }
]

export default function GeneratePage() {
  const [activeStep, setActiveStep] = useState('literary')
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

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

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>Create AI Video</h1>

      <div className='mb-8'>
        <div className='mb-4 flex items-center justify-between'>
          {steps.map((step, index) => (
            <div key={step.id} className='flex flex-col items-center'>
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
              <span className='mt-2 hidden text-xs md:block'>{step.label}</span>
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

      <Card className='p-6'>
        <Tabs value={activeStep} className='w-full'>
          <TabsContent value='literary'>
            <LiteraryCreator onComplete={handleNext} />
          </TabsContent>
          <TabsContent value='voice'>
            <VoiceConfiguration onComplete={handleNext} />
          </TabsContent>
          <TabsContent value='images'>
            <ImageVideoGenerator onComplete={handleNext} />
          </TabsContent>
          <TabsContent value='editor'>
            <VideoEditor onComplete={handleNext} />
          </TabsContent>
          <TabsContent value='publish'>
            <Publishing />
          </TabsContent>
        </Tabs>

        <div className='mt-8 flex justify-between'>
          <Button
            variant='outline'
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className='mr-2 h-4 w-4' /> Previous
          </Button>

          {activeStep !== 'publish' ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          ) : (
            <Button>Finish</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
