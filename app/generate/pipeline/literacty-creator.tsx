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
import { SensitiveContentDialog } from '@/components/ui/error-dialog'

import {
  Loader2,
  FileText,
  Type,
  Check,
  Upload,
  Users,
  Bot,
  CheckCheck,
  Copy
} from 'lucide-react'
import type { Scene, Story } from '@/app/utils/type'
import { useGenerationStore } from '@/store/useGenerationStore'
import { Slider } from '@/components/ui/slider'
import mammoth from 'mammoth'
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf'
import axios from 'axios'

// This works with bundlers that support web workers properly
PDFJS.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.js',
  import.meta.url
).toString()

interface FileProcessingResult {
  content: string
  success: boolean
  error?: string
}

const SUGGESTED_TOPICS = [
  'The Evolution of Artificial Intelligence',
  'Climate Change: Causes and Solutions',
  'The Future of Space Exploration',
  'Understanding Quantum Computing',
  'The History of Cinema'
]

const AUDIENCE_STYLES = [
  {
    id: 'students',
    name: 'Students',
    description:
      'Friendly and relatable tone with concrete examples and simple language.',
    contentStyle: 'storytelling',
    personalizedStyle:
      'friendly and simple language with specific examples for students'
  },
  {
    id: 'technical_experts',
    name: 'Technical Experts',
    description:
      'Accurate explanations using technical terminology and clear logic.',
    contentStyle: 'analysis',
    personalizedStyle:
      'technical terminology with precise and logical explanations'
  },
  {
    id: 'beginners',
    name: 'Beginners',
    description:
      'Thorough explanations without abbreviations, using visual aids if needed.',
    contentStyle: 'analysis',
    personalizedStyle:
      'detailed explanations without abbreviations, suitable for beginners'
  },
  {
    id: 'elderly',
    name: 'Elderly',
    description:
      'Clear and easy-to-understand content with concise and straightforward explanations.',
    contentStyle: 'storytelling',
    personalizedStyle:
      'clear, concise content with straightforward language for elderly readers'
  },
  {
    id: 'children',
    name: 'Children',
    description:
      'Fun and engaging content with short sentences and vivid imagery.',
    contentStyle: 'storytelling',
    personalizedStyle: 'fun, engaging content with short sentences for children'
  }
]

const AI_MODELS = [
  {
    id: 'gemini',
    name: 'GEMINI',
    description:
      "Google's advanced AI model with strong creative writing capabilities",
    logo: 'https://www.pngall.com/wp-content/uploads/16/Google-Gemini-Logo-Transparent.png'
  },
  {
    id: 'meta',
    name: 'META',
    description:
      "Meta's powerful AI model optimized for diverse content generation",
    logo: 'https://tse2.mm.bing.net/th/id/OIP.mj65YatMOlC-OtA9LwH8zQHaHc?rs=1&pid=ImgDetMain'
  }
]

const SCENE_COUNT_OPTIONS = [3, 5, 7, 10]

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
  const [scriptGenerated, setScriptGenerated] = useState(false)
  const [scriptEdited, setScriptEdited] = useState(false)

  // Track overall completion
  // const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<String>('')

  // Scence count
  const [sceneCount, setSceneCount] = useState<number>(5)
  const [customSceneCount, setCustomSceneCount] = useState<string>('5')
  const [isCustomSceneCount, setIsCustomSceneCount] = useState(false)
  const [sceneCountSelected, setSceneCountSelected] = useState(true)

  // Personalize the script
  const [personalizeStyle, setPersonalizeStyle] = useState(false)
  const [personalizedStyleInput, setPersonalizedStyleInput] = useState('')

  // Style for group audience
  const [useAudienceStyle, setUseAudienceStyle] = useState(false)
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null)

  // AI model
  const [selectedAIModel, setSelectedAIModel] = useState<string | null>(null)

  // Copy state
  const [isCopied, setIsCopied] = useState(false)

  const { setStory, story } = useGenerationStore()

  // For displaying sensitive content error
  const [showSensitiveContentModal, setShowSensitiveContentModal] =
    useState(false)

  // Update completion status when script is approved
  useEffect(() => {
    if (isScriptApproved) {
      onComplete()
    }
  }, [isScriptApproved, onComplete])

  const handleAIModelSelect = (modelId: string) => {
    setSelectedAIModel(modelId)
  }

  const handleAudienceSelect = (audienceId: string) => {
    setSelectedAudience(audienceId)

    const selectedAudienceStyle = AUDIENCE_STYLES.find(
      audience => audience.id === audienceId
    )

    if (selectedAudienceStyle) {
      setContentStyle(selectedAudienceStyle.contentStyle)
      setPersonalizedStyleInput(selectedAudienceStyle.personalizedStyle)
      setPersonalizeStyle(true)
    }
  }

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const handleToggleAudienceStyle = () => {
    const newValue = !useAudienceStyle
    setUseAudienceStyle(newValue)

    if (!newValue) {
      setSelectedAudience(null)
      setContentStyle('analysis')
      setPersonalizeStyle(false)
      setPersonalizedStyleInput('')
    }
  }

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic)
    setTopicSelected(true)
  }

  const handleContentStyleChange = (style: string) => {
    setContentStyle(style)
  }

  function extractScript(story: Story): string {
    if (!story || !story.scenes) {
      throw new Error('Story or story.scenes is undefined')
    }

    return story.scenes
      .map((scene: Scene) => `# ${scene.title}\n${scene.narration}`)
      .join('\n\n')
  }

  const generateScript = async () => {
    try {
      const newTopic = {
        topic: topic,
        type: contentStyle,
        personalizeStyle: personalizedStyleInput,
        sceneCount: sceneCount,
        AI_type: selectedAIModel
      }

      const result = await axios.post(
        'http://127.0.0.1:8787/api/generate/content',
        newTopic
      )

      return result.data
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      throw err
    }
  }

  const handleGenerateScript = async () => {
    if (!topic) return

    setIsGenerating(true)
    setError('')

    try {
      const data = await generateScript()
      console.log('data script', data)
      setStory(data.story)
      const script = extractScript(data.story as Story)
      setGeneratedScript(script)
      setActiveTab('preview')
    } catch (err: any) {
      console.log('Error', err)
      if (err.status == 400) {
        setError(
          'Your content is including sensitive content. Please try again with another topic'
        )
        setTopic('')
        setShowSensitiveContentModal(true)
        return
      }

      console.error('Error generating script:', err)
      setError(
        `Cannot generate content because: ${err.message || 'Unknown error'}`
      )
      handleFallbackScriptGeneration()
    } finally {
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

  const handleScriptEdit = (newScript: string) => {
    setGeneratedScript(newScript)
    setScriptEdited(true)
    setIsScriptApproved(false)
  }

  const handleApproveScript = () => {
    setIsScriptApproved(true)
    console.log(story)

    const finalStory = story
    story.prompt = generatedScript

    console.log('Final story', finalStory)
    setStory(finalStory)
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

  const handleProcessFile = async () => {
    if (!uploadedFile) return

    setIsProcessingFile(true)

    try {
      // Extract file extension
      const fileExt = uploadedFile.name.split('.').pop()?.toLowerCase()

      // Set topic to filename without extension
      const fileName = uploadedFile.name.split('.')[0]
      setTopic(fileName)
      setTopicSelected(true)

      // Process the file based on type
      let extractedContent = ''

      if (fileExt === 'pdf') {
        const result = await extractPdfContent(uploadedFile)
        if (result.success) {
          extractedContent = result.content
        } else {
          throw new Error(result.error || 'Failed to process PDF')
        }
      } else if (fileExt === 'docx' || fileExt === 'doc') {
        const result = await extractWordContent(uploadedFile)
        if (result.success) {
          extractedContent = result.content
        } else {
          throw new Error(result.error || 'Failed to process Word document')
        }
      } else if (fileExt === 'txt' || fileExt === 'text') {
        const result = await extractTextContent(uploadedFile)
        if (result.success) {
          extractedContent = result.content
        } else {
          throw new Error(result.error || 'Failed to process text file')
        }
      } else {
        throw new Error(`Unsupported file type: ${fileExt}`)
      }

      // Format the extracted content
      const formattedContent = `# Content extracted from ${uploadedFile.name}\n\n${extractedContent}`

      setGeneratedScript(formattedContent)
      setFileProcessed(true)
      setScriptGenerated(true)
    } catch (error) {
      console.error('Error processing file:', error)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleSceneCountSelect = (count: number) => {
    setSceneCount(count)
    setCustomSceneCount(count.toString())
    setIsCustomSceneCount(false)
    setSceneCountSelected(true)
  }

  const handleCustomSceneCountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setCustomSceneCount(value)

    const parsedValue = Number.parseInt(value, 10)
    if (!isNaN(parsedValue) && parsedValue > 0) {
      setSceneCount(parsedValue)
      setSceneCountSelected(true)
    } else {
      setSceneCountSelected(false)
    }
  }

  const handleCustomSceneCountToggle = () => {
    setIsCustomSceneCount(!isCustomSceneCount)
    if (!isCustomSceneCount) {
      setCustomSceneCount(sceneCount.toString())
    }
  }

  /**
   * Extract text from a PDF file
   */
  const extractPdfContent = async (
    file: File
  ): Promise<FileProcessingResult> => {
    try {
      // Convert the file to an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Load the PDF document
      const pdfDoc = await PDFJS.getDocument({ data: arrayBuffer }).promise

      // Variable to store all text content
      let fullText = ''

      // Process each page
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const textContent = await page.getTextContent()

        // Extract text from each text item and join with spaces
        const pageText = textContent.items
          .filter(item => 'str' in item) // Make sure item has a 'str' property
          .map(item => ('str' in item ? (item as any).str : ''))
          .join(' ')

        fullText += pageText + '\n\n'
      }

      return {
        content: fullText.trim(),
        success: true
      }
    } catch (error) {
      console.error('Error extracting PDF content:', error)
      return {
        content: '',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error extracting PDF content'
      }
    }
  }

  /**
   * Extract text from a Word document (DOC/DOCX)
   */
  const extractWordContent = async (
    file: File
  ): Promise<FileProcessingResult> => {
    try {
      // Convert the file to an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Use mammoth to extract text content
      const result = await mammoth.extractRawText({ arrayBuffer })

      return {
        content: result.value,
        success: true
      }
    } catch (error) {
      console.error('Error extracting Word document content:', error)
      return {
        content: '',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error extracting Word document content'
      }
    }
  }

  /**
   * Extract text from a plain text file
   */
  const extractTextContent = async (
    file: File
  ): Promise<FileProcessingResult> => {
    try {
      // Use FileReader to read the text file
      return new Promise(resolve => {
        const reader = new FileReader()

        reader.onload = e => {
          const content = (e.target?.result as string) || ''
          resolve({
            content,
            success: true
          })
        }

        reader.onerror = () => {
          resolve({
            content: '',
            success: false,
            error: 'Error reading text file'
          })
        }

        reader.readAsText(file)
      })
    } catch (error) {
      console.error('Error extracting text file content:', error)
      return {
        content: '',
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error extracting text file content'
      }
    }
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

  const selectedModel = AI_MODELS.find(model => model.name === selectedAIModel)

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
                    placeholder='Enter a  literary topic'
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

                <div className='mt-6 border-t pt-4'>
                  <div className='mb-4 flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='audience-style'
                      checked={useAudienceStyle}
                      onChange={handleToggleAudienceStyle}
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='audience-style' className='font-medium'>
                      <Users className='mr-2 inline-block h-4 w-4' />
                      Customize style based on audience
                    </Label>
                  </div>

                  {useAudienceStyle ? (
                    <div className='space-y-4'>
                      <p className='text-sm text-muted-foreground'>
                        Select your target audience to automatically set the
                        appropriate writing style
                      </p>
                      <div className='grid grid-cols-1 gap-3'>
                        {AUDIENCE_STYLES.map(audience => (
                          <Card
                            key={audience.id}
                            className={`cursor-pointer transition-colors hover:border-primary ${selectedAudience === audience.id ? 'border-primary bg-primary/10' : ''}`}
                            onClick={() => handleAudienceSelect(audience.id)}
                          >
                            <CardContent className='p-4'>
                              <div className='flex items-center justify-between'>
                                <div>
                                  <h3 className='font-medium'>
                                    {audience.name}
                                  </h3>
                                  <p className='text-sm text-muted-foreground'>
                                    {audience.description}
                                  </p>
                                </div>
                                {selectedAudience === audience.id && (
                                  <Check className='h-5 w-5 text-primary' />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className='mt-4'>
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
                          <RadioGroupItem
                            value='storytelling'
                            id='storytelling'
                          />
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

                      {/* Tùy chọn cá nhân hóa phong cách viết */}
                      <div className='mt-4 border-t pt-4'>
                        <div className='mb-2 flex items-center space-x-2'>
                          <input
                            type='checkbox'
                            id='personalize-style'
                            checked={personalizeStyle}
                            onChange={() =>
                              setPersonalizeStyle(!personalizeStyle)
                            }
                            className='rounded border-gray-300'
                          />
                          <Label htmlFor='personalize-style'>
                            Personalize writing style
                          </Label>
                        </div>

                        {personalizeStyle && (
                          <div className='mt-2'>
                            <Label
                              htmlFor='personalized-style-input'
                              className='text-sm'
                            >
                              Write in the style of (e.g., "Ernest Hemingway",
                              "a tech blog", "a fairy tale")
                            </Label>
                            <Input
                              id='personalized-style-input'
                              placeholder='Enter a writing style or author'
                              value={personalizedStyleInput}
                              onChange={e =>
                                setPersonalizedStyleInput(e.target.value)
                              }
                              className='mt-1'
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className='mt-6'>
                  <Label className='mb-2 block'>Number of Scenes</Label>
                  <p className='mb-3 text-sm text-muted-foreground'>
                    Select how many scenes you want to generate for your video
                  </p>

                  <div className='mb-3 grid grid-cols-4 gap-2'>
                    {SCENE_COUNT_OPTIONS.map(count => (
                      <Card
                        key={count}
                        className={`cursor-pointer transition-colors hover:border-primary ${
                          sceneCount === count && !isCustomSceneCount
                            ? 'border-primary bg-primary/10'
                            : ''
                        }`}
                        onClick={() => handleSceneCountSelect(count)}
                      >
                        <CardContent className='p-3 text-center'>
                          <div className='flex items-center justify-center'>
                            <span className='text-lg font-medium'>{count}</span>
                            {sceneCount === count && !isCustomSceneCount && (
                              <Check className='ml-2 h-4 w-4 text-primary' />
                            )}
                          </div>
                          <span className='text-xs text-muted-foreground'>
                            scenes
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className='mb-2 flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='custom-scene-count'
                      checked={isCustomSceneCount}
                      onChange={handleCustomSceneCountToggle}
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='custom-scene-count'>
                      Custom number of scenes
                    </Label>
                  </div>

                  {isCustomSceneCount && (
                    <div className='flex items-center space-x-2'>
                      <Input
                        type='number'
                        min='1'
                        max='20'
                        value={customSceneCount}
                        onChange={handleCustomSceneCountChange}
                        className='w-24'
                      />
                      <span className='text-sm text-muted-foreground'>
                        scenes (1-20)
                      </span>
                    </div>
                  )}
                </div>

                <div className='mt-6 border-t pt-4'>
                  <Label className='mb-2 block'>Select AI Model</Label>
                  <p className='mb-3 text-sm text-muted-foreground'>
                    Choose which AI model will generate your script
                  </p>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {AI_MODELS.map(model => (
                      <Card
                        key={model.name}
                        className={`cursor-pointer transition-colors hover:border-primary ${
                          selectedAIModel === model.name
                            ? 'border-primary bg-primary/10'
                            : ''
                        }`}
                        onClick={() => handleAIModelSelect(model.name)}
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-center space-x-3'>
                            <div className='flex-shrink-0'>
                              <img
                                src={model.logo || '/placeholder.svg'}
                                alt={model.name}
                                className='h-10 w-10 rounded-full'
                              />
                            </div>
                            <div className='flex-grow'>
                              <h3 className='font-medium'>{model.name}</h3>
                              <p className='text-xs text-muted-foreground'>
                                {model.description}
                              </p>
                            </div>
                            {selectedAIModel === model.name && (
                              <Check className='h-5 w-5 flex-shrink-0 text-primary' />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateScript}
                  disabled={
                    !topicSelected ||
                    (useAudienceStyle ? !selectedAudience : false) ||
                    !sceneCountSelected ||
                    isGenerating ||
                    (!useAudienceStyle &&
                      personalizeStyle &&
                      personalizedStyleInput.trim() === '') ||
                    !selectedAIModel
                  }
                  className='w-full'
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Generating Script with{' '}
                      {selectedAIModel === 'GEMINI' ? 'GEMINI' : 'META'}...
                    </>
                  ) : (
                    <>
                      <Bot className='mr-2 h-4 w-4' />
                      Generate Script with{' '}
                      {selectedAIModel
                        ? selectedAIModel === 'GEMINI'
                          ? 'GEMINI'
                          : 'META'
                        : 'AI'}
                    </>
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
            {/* Selected Settings Summary */}
            <Card className='border-muted-foreground/20'>
              <CardContent className='p-6'>
                <h3 className='mb-4 flex items-center text-lg font-medium'>
                  <span className='mr-2 rounded-full bg-primary/10 p-1 text-primary'>
                    <Check className='h-4 w-4' />
                  </span>
                  Selected Settings
                </h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <h4 className='text-sm font-medium text-muted-foreground'>
                      Topic
                    </h4>
                    <p className='font-medium'>{topic}</p>
                  </div>
                  <div>
                    <h4 className='text-sm font-medium text-muted-foreground'>
                      AI Model
                    </h4>
                    <p className='flex items-center font-medium'>
                      {selectedModel && (
                        <>
                          <img
                            src={selectedModel.logo}
                            alt={selectedModel.name}
                            className='mr-1 h-5 w-5 rounded-full'
                          />
                          {selectedModel.name}
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className='text-sm font-medium text-muted-foreground'>
                      {useAudienceStyle ? 'Target Audience' : 'Content Style'}
                    </h4>
                    <p className='font-medium'>
                      {useAudienceStyle
                        ? AUDIENCE_STYLES.find(a => a.id === selectedAudience)
                            ?.name || 'Not selected'
                        : contentStyle === 'analysis'
                          ? 'Analysis'
                          : contentStyle === 'storytelling'
                            ? 'Storytelling'
                            : 'Poetry Illustration'}
                    </p>
                  </div>
                  <div>
                    <h4 className='text-sm font-medium text-muted-foreground'>
                      Number of Scenes
                    </h4>
                    <p className='font-medium'>{sceneCount}</p>
                  </div>
                  {personalizeStyle && personalizedStyleInput && (
                    <div className='col-span-2'>
                      <h4 className='text-sm font-medium text-muted-foreground'>
                        Personalized Style
                      </h4>
                      <p className='font-medium'>{personalizedStyleInput}</p>
                    </div>
                  )}
                  {inputMethod === 'upload' && uploadedFile && (
                    <div className='col-span-2'>
                      <h4 className='text-sm font-medium text-muted-foreground'>
                        Uploaded Document
                      </h4>
                      <p className='flex items-center font-medium'>
                        <FileText className='mr-1 h-4 w-4 text-muted-foreground' />
                        {uploadedFile.name} (
                        {(uploadedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Script Preview */}
            <Card>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <h3 className='flex items-center text-lg font-medium'>
                    <Bot className='mr-2 h-5 w-5 text-primary' />
                    Generated Script
                  </h3>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCopyScript}
                      className='transition-all'
                      disabled={isCopied}
                    >
                      {isCopied ? (
                        <>
                          <CheckCheck className='mr-1 h-4 w-4 text-green-500' />
                          <span className='text-green-500'>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className='mr-1 h-4 w-4' />
                          Copy Script
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className='max-h-[500px] min-h-[300px] overflow-y-auto whitespace-pre-line rounded-md border bg-muted/50 p-4'>
                  {generatedScript ||
                    'No script generated yet. Please go back and generate a script.'}
                </div>
              </CardContent>
            </Card>

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
      <SensitiveContentDialog
        open={showSensitiveContentModal}
        onClose={() => setShowSensitiveContentModal(false)}
      />
    </div>
  )
}
