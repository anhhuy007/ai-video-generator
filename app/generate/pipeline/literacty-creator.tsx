'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, FileText } from 'lucide-react'
import type { Scene, Story } from '@/app/utils/type'
import { useGenerationStore } from '@/store/useGenerationStore'
import { Slider } from '@/components/ui/slider'
import { useScript } from '@/app/context/ScriptContext';

const SUGGESTED_TOPICS = [
  'The Evolution of Artificial Intelligence',
  'Climate Change: Causes and Solutions',
  'The Future of Space Exploration',
  'Understanding Quantum Computing',
  'The History of Cinema'
]

function extractScript(story: Story): string {
  try {
    return story.scenes
      .map((scene: Scene) => `# ${scene.title}\n${scene.narration}`)
      .join('\n\n')
  } catch (error) {
    console.error('Error processing scenes:', error)
    return ''
  }
}

export default function LiteraryCreator({
  onComplete
}: {
  onComplete: () => void
}) {
  const [topic, setTopic] = useState('')
  const [contentStyle, setContentStyle] = useState('analysis')
  const [generatedScript, setGeneratedScript] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('create')
  const [error, setError] = useState('')
  const [sceneCount, setSceneCount] = useState(3)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const { setStory } = useGenerationStore()
  const { setScript } = useScript(); // Lấy hàm setScript từ Context


  const handleGenerateScript = () => {
    if (!topic) return

    setIsGenerating(true)
    setError('')

    try {
      fetch('http://127.0.0.1:8787/api/generate/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          sceneCount
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response error: ${response.status}`)
          }
          return response.text()
        })
        .then(data => {
          try {
            const parsedData = JSON.parse(data)
            const story = parsedData.story as Story
            setStory(story)
            const script = extractScript(story)
            setGeneratedScript(script)
            setScript(script)
            setActiveTab('preview')
          } catch (err) {
            console.error('Error extracting script:', err)
            setError('Failed to process the generated script data')
            handleFallbackScriptGeneration()
          }
        })
        .catch(error => {
          console.error('Error generating script:', error)
          setError(`Failed to generate script: ${error.message}`)
          handleFallbackScriptGeneration()
        })
        .finally(() => {
          setIsGenerating(false)
        })
    } catch (error) {
      console.error('Exception during fetch:', error)
      handleFallbackScriptGeneration()
      setIsGenerating(false)
    }
  }

  const handleFallbackScriptGeneration = () => {
    console.log('Using fallback script generation')

    const scriptIntros = {
      analysis: `# Analysis: ${topic}\n\nIn this comprehensive analysis, we'll explore the key aspects of ${topic} and its implications for our future. The subject presents several interesting dimensions worth examining in detail.`,
      storytelling: `# The Story of ${topic}\n\nOnce upon a time, in a world not so different from our own, the concept of ${topic} began to take shape. This is the remarkable journey of how it evolved and changed our understanding.`,
      poetry: `# Poetic Illustration: ${topic}\n\nThrough the lens of time,\n${topic} emerges, sublime.\nPatterns unfold, mysteries defined,\nIn verses of knowledge, beautifully aligned.`
    }

    setGeneratedScript(scriptIntros[contentStyle as keyof typeof scriptIntros])
    setActiveTab('preview')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const fileName = file.name.split('.')[0]
      setTopic(fileName)
    }
  }

  const handleApproveScript = () => {
    onComplete()
  }

  return (
    <div className='mx-auto max-w-2xl p-4'>
      <h2 className='mb-2 text-xl font-medium'>Script Generator</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-4 grid w-full grid-cols-2'>
          <TabsTrigger value='create'>Create</TabsTrigger>
          <TabsTrigger value='preview' disabled={!generatedScript}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value='create'>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='topic' className='text-sm'>
                Topic
              </Label>
              <Input
                id='topic'
                placeholder='Enter a topic'
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className='mb-2'
              />

              <div className='mt-2 flex flex-wrap gap-2'>
                {SUGGESTED_TOPICS.map(suggestedTopic => (
                  <Button
                    key={suggestedTopic}
                    variant='outline'
                    size='sm'
                    className={`text-xs ${topic === suggestedTopic ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => setTopic(suggestedTopic)}
                  >
                    {suggestedTopic}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className='text-sm'>Content Style</Label>
              <RadioGroup
                value={contentStyle}
                onValueChange={setContentStyle}
                className='mt-1 space-y-1'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='analysis' id='analysis' />
                  <Label htmlFor='analysis' className='text-sm'>
                    Analysis
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='storytelling' id='storytelling' />
                  <Label htmlFor='storytelling' className='text-sm'>
                    Storytelling
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='poetry' id='poetry' />
                  <Label htmlFor='poetry' className='text-sm'>
                    Poetry
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <div className='flex items-center justify-between'>
                <Label className='text-sm'>Scene Count: {sceneCount}</Label>
              </div>
              <Slider
                value={[sceneCount]}
                min={1}
                max={10}
                step={1}
                onValueChange={value => setSceneCount(value[0])}
                className='my-2'
              />
            </div>

            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <FileText className='h-4 w-4' />
              <span>Or</span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => document.getElementById('file-upload')?.click()}
                className='h-8'
              >
                Upload Document
              </Button>
              <input
                type='file'
                id='file-upload'
                className='hidden'
                accept='.pdf,.doc,.docx'
                onChange={handleFileUpload}
              />
              {uploadedFile && (
                <span className='text-xs'>{uploadedFile.name}</span>
              )}
            </div>

            {error && (
              <div className='rounded-md bg-red-50 p-2 text-sm text-red-500'>
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerateScript}
              disabled={!topic || isGenerating}
              className='w-full'
            >
              {isGenerating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Generating...
                </>
              ) : (
                'Generate Script'
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value='preview'>
          <div className='space-y-4'>
            <div>
              <div className='mb-2 flex items-center justify-between'>
                <Label className='text-sm'>Script Preview</Label>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setActiveTab('create')}
                >
                  Edit
                </Button>
              </div>
              <div className='min-h-[200px] whitespace-pre-line rounded-md border bg-muted/20 p-4 text-sm'>
                {generatedScript}
              </div>
            </div>

            <Button className='w-full' onClick={handleApproveScript}>
              Approve Script
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
