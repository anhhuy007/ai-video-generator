'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Loader2, Upload, FileText, Type } from 'lucide-react'

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

  // Input method state
  const [inputMethod, setInputMethod] = useState<'type' | 'upload'>('type')

  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [fileProcessed, setFileProcessed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Step completion states
  const [topicSelected, setTopicSelected] = useState(false)
  const [styleSelected, setStyleSelected] = useState(false)
  const [scriptGenerated, setScriptGenerated] = useState(false)
  const [scriptEdited, setScriptEdited] = useState(false)

  // Track overall completion
  const [isComplete, setIsComplete] = useState(false)

  // Update completion status when script is approved
  useEffect(() => {
    if (isScriptApproved) {
      setIsComplete(true)
      onComplete()
    }
  }, [isScriptApproved, onComplete])

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic)
    setTopicSelected(true)
  }

  const handleContentStyleChange = (style: string) => {
    setContentStyle(style)
    setStyleSelected(true)
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
      setScriptGenerated(true)
      setActiveTab('preview')
    }, 2000)
  }

  const handleScriptEdit = (newScript: string) => {
    setGeneratedScript(newScript)
    setScriptEdited(true)
  }

  const handleApproveScript = () => {
    setIsScriptApproved(true)
  }

  // File upload handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setFileProcessed(false)
      setTopicSelected(false)
    }
  }

  const handleProcessFile = () => {
    if (!uploadedFile) return

    setIsProcessingFile(true)

    // Simulate file processing
    setTimeout(() => {
      // Extract file extension
      const fileExt = uploadedFile.name.split('.').pop()?.toLowerCase()

      // Set topic to filename without extension
      const fileName = uploadedFile.name.split('.')[0]
      setTopic(fileName)
      setTopicSelected(true)

      // Generate simulated content based on file type
      let extractedContent = ''
      if (fileExt === 'pdf') {
        extractedContent = `# Content extracted from PDF: ${uploadedFile.name}\n\nThis is the simulated content extracted from your PDF file. In a real implementation, we would parse the actual PDF content.\n\nThe document appears to discuss important aspects of ${fileName}, including key concepts and practical applications.`
      } else if (fileExt === 'docx' || fileExt === 'doc') {
        extractedContent = `# Content extracted from Word document: ${uploadedFile.name}\n\nThis is the simulated content extracted from your Word document. In a real implementation, we would parse the actual document content.\n\nThe document contains several sections covering ${fileName} with detailed explanations and examples.`
      } else {
        extractedContent = `# Content extracted from ${uploadedFile.name}\n\nThis is the simulated content extracted from your file. The system has attempted to parse the content and prepare it for video creation.`
      }

      setGeneratedScript(extractedContent)
      setIsProcessingFile(false)
      setFileProcessed(true)
      setScriptGenerated(true)
    }, 2000)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      setUploadedFile(file)
      setFileProcessed(false)
      setTopicSelected(false)
    }
  }

  // Check if topic tab is complete
  const isTopicTabComplete = () => {
    if (inputMethod === 'type') {
      return topicSelected && styleSelected
    } else {
      return fileProcessed
    }
  }

  return (
    <div>
      <h2 className='mb-4 text-2xl font-bold'>Literary Video Creator</h2>
      <p className='mb-6 text-muted-foreground'>
        Enter a topic or upload a document, then choose your content style and
        generate a script.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-3'>
          <TabsTrigger value='topic'>Topic Selection</TabsTrigger>
          <TabsTrigger value='preview' disabled={!scriptGenerated}>
            Script Preview
          </TabsTrigger>
          <TabsTrigger value='edit' disabled={!scriptGenerated}>
            Edit Script
          </TabsTrigger>
        </TabsList>

        <TabsContent value='topic'>
          <div className='space-y-6'>
            <div className='mb-6 flex space-x-4'>
              <Button
                variant={inputMethod === 'type' ? 'default' : 'outline'}
                className='flex-1'
                onClick={() => setInputMethod('type')}
              >
                <Type className='mr-2 h-4 w-4' />
                Type Topic
              </Button>
              <Button
                variant={inputMethod === 'upload' ? 'default' : 'outline'}
                className='flex-1'
                onClick={() => setInputMethod('upload')}
              >
                <FileText className='mr-2 h-4 w-4' />
                Upload Document
              </Button>
            </div>

            {inputMethod === 'type' ? (
              <>
                <div>
                  <Label htmlFor='topic'>Enter your topic</Label>
                  <Input
                    id='topic'
                    placeholder='Enter a literary topic'
                    value={topic}
                    onChange={e => {
                      setTopic(e.target.value)
                      if (e.target.value) {
                        setTopicSelected(true)
                      } else {
                        setTopicSelected(false)
                      }
                    }}
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
                    onValueChange={handleContentStyleChange}
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
                  disabled={!topicSelected || !styleSelected || isGenerating}
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
              </>
            ) : (
              <div>
                <Label>Upload Document</Label>
                <p className='mb-4 text-sm text-muted-foreground'>
                  Upload a PDF or Word document to extract content for your
                  video
                </p>

                <div
                  className={`rounded-md border-2 border-dashed p-8 text-center ${isDragging ? 'border-primary bg-primary/5' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className='mx-auto mb-4 h-10 w-10 text-muted-foreground' />
                  <p className='mb-2 text-sm text-muted-foreground'>
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className='mb-4 text-xs text-muted-foreground'>
                    Supported formats: PDF, DOC, DOCX
                  </p>
                  <input
                    type='file'
                    id='file-upload'
                    className='hidden'
                    accept='.pdf,.doc,.docx'
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                  >
                    Select File
                  </Button>
                </div>

                {uploadedFile && (
                  <div className='mt-4 rounded-md border bg-muted/30 p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <FileText className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='text-sm font-medium'>
                            {uploadedFile.name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        size='sm'
                        onClick={handleProcessFile}
                        disabled={isProcessingFile || fileProcessed}
                      >
                        {isProcessingFile ? (
                          <>
                            <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                            Processing...
                          </>
                        ) : fileProcessed ? (
                          <>
                            <Check className='mr-2 h-3 w-3' />
                            Processed
                          </>
                        ) : (
                          'Process File'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {fileProcessed && (
                  <Button
                    className='mt-4 w-full'
                    onClick={() => setActiveTab('preview')}
                  >
                    Continue to Preview
                  </Button>
                )}
              </div>
            )}
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
