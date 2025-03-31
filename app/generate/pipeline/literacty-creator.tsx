'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Loader2 } from 'lucide-react'

const SUGGESTED_TOPICS = [
  'The Evolution of Artificial Intelligence',
  'Climate Change: Causes and Solutions',
  'The Future of Space Exploration',
  'Understanding Quantum Computing',
  'The History of Cinema'
]

export default function LiteraryCreator({
  onComplete
}: {
  onComplete: () => void
}) {
  const [topic, setTopic] = useState('')
  const [contentStyle, setContentStyle] = useState('analysis')
  const [generatedScript, setGeneratedScript] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScriptApproved, setIsScriptApproved] = useState(false)
  const [activeTab, setActiveTab] = useState('topic')

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic)
  }

  const handleGenerateScript = () => {
    if (!topic) return

    setIsGenerating(true)

    // Simulate AI script generation
    setTimeout(() => {
      const scriptIntros = {
        analysis: `# Analysis: ${topic}\n\nIn this comprehensive analysis, we'll explore the key aspects of ${topic} and its implications for our future. The subject presents several interesting dimensions worth examining in detail.`,
        storytelling: `# The Story of ${topic}\n\nOnce upon a time, in a world not so different from our own, the concept of ${topic} began to take shape. This is the remarkable journey of how it evolved and changed our understanding.`,
        poetry: `# Poetic Illustration: ${topic}\n\nThrough the lens of time,\n${topic} emerges, sublime.\nPatterns unfold, mysteries defined,\nIn verses of knowledge, beautifully aligned.`
      }

      setGeneratedScript(
        scriptIntros[contentStyle as keyof typeof scriptIntros]
      )
      setIsGenerating(false)
      setActiveTab('preview')
    }, 2000)
  }

  const handleScriptEdit = (newScript: string) => {
    setGeneratedScript(newScript)
  }

  const handleApproveScript = () => {
    setIsScriptApproved(true)
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  return (
    <div>
      <h2 className='mb-4 text-2xl font-bold'>Literary Video Creator</h2>
      <p className='mb-6 text-muted-foreground'>
        Enter a topic or select from suggestions, then choose your content style
        and generate a script.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-3'>
          <TabsTrigger value='topic'>Topic Selection</TabsTrigger>
          <TabsTrigger value='preview' disabled={!topic}>
            Script Preview
          </TabsTrigger>
          <TabsTrigger value='edit' disabled={!generatedScript}>
            Edit Script
          </TabsTrigger>
        </TabsList>

        <TabsContent value='topic'>
          <div className='space-y-6'>
            <div>
              <Label htmlFor='topic'>Enter your topic</Label>
              <Input
                id='topic'
                placeholder='Enter a literary topic'
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className='mb-2'
              />
              <p className='text-sm text-muted-foreground'>
                Or select from suggested topics below
              </p>
            </div>

            <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
              {SUGGESTED_TOPICS.map(suggestedTopic => (
                <Card
                  key={suggestedTopic}
                  className={`cursor-pointer transition-colors hover:border-primary ${topic === suggestedTopic ? 'border-primary bg-primary/10' : ''}`}
                  onClick={() => handleTopicSelect(suggestedTopic)}
                >
                  <CardContent className='p-3'>
                    <div className='flex items-center justify-between'>
                      <span>{suggestedTopic}</span>
                      {topic === suggestedTopic && (
                        <Check className='h-4 w-4 text-primary' />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='mt-6'>
              <Label>Content Style</Label>
              <RadioGroup
                value={contentStyle}
                onValueChange={setContentStyle}
                className='mt-2 flex flex-col space-y-2'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='analysis' id='analysis' />
                  <Label htmlFor='analysis'>
                    Analysis - Detailed examination of the topic
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='storytelling' id='storytelling' />
                  <Label htmlFor='storytelling'>
                    Storytelling - Narrative approach to the topic
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='poetry' id='poetry' />
                  <Label htmlFor='poetry'>
                    Poetry Illustration - Artistic interpretation
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleGenerateScript}
              disabled={!topic || isGenerating}
              className='w-full'
            >
              {isGenerating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Generating Script...
                </>
              ) : (
                'Generate Script'
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value='preview'>
          <div className='space-y-6'>
            <div>
              <Label>Script Preview</Label>
              <div className='mt-2 min-h-[200px] whitespace-pre-line rounded-md border bg-muted/50 p-4'>
                {generatedScript ||
                  'No script generated yet. Please go back and generate a script.'}
              </div>
            </div>

            <div className='flex space-x-4'>
              <Button variant='outline' onClick={() => setActiveTab('topic')}>
                Back to Topic
              </Button>
              <Button onClick={() => setActiveTab('edit')}>Edit Script</Button>
              <Button
                variant='default'
                className='ml-auto'
                onClick={handleApproveScript}
              >
                Approve Script
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='edit'>
          <div className='space-y-6'>
            <div>
              <Label htmlFor='script-editor'>Edit Script</Label>
              <Textarea
                id='script-editor'
                value={generatedScript}
                onChange={e => handleScriptEdit(e.target.value)}
                className='min-h-[300px] font-mono'
              />
            </div>

            <div className='flex justify-between'>
              <Button variant='outline' onClick={() => setActiveTab('preview')}>
                Back to Preview
              </Button>
              <Button onClick={handleApproveScript} disabled={isScriptApproved}>
                {isScriptApproved ? (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    Script Approved
                  </>
                ) : (
                  'Approve Script'
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
