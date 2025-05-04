type User = {
  name: string
  email: string
  image: string
}

type Session = {
  user: User
  expires: string
}

type Scene = {
  id: number
  title: string
  description: string
  image: string
  narration: string
}

type Character = {
  id: number
  name: string
  description: string
}

type Story = {
  prompt: string
  scenesCount: number
  scenes: Scene[]
  characters: Character[]
  theme: string
}

type StoryRequest = {
  prompt: string // Detailed novel description with scenes
  sceneCount: number
}

type StoryReponse = {
  story: Story
  images: string[] // Array of base64 encoded images for each scene
}

type AIModel = {
  API_KEY: string
  URL: string
  requestBody: string
}

type LLMResponse = {
  candidates: {
    content: {
      parts: {
        text: string
      }[]
    }
  }[]
}

type MediaItem = {
  id: string
  title: string
  image: string
  audio: string
  duration: number
  transitionIn: string
  transitionOut: string
}

type Effect = {
  subtitleStyle: string
  subtitlePosition: string
  musicStyle: BackgroundMusic
}

type BackgroundMusic = {
  musicStyle: string
  mp3Url: string
  volume: number
}

export interface Publication {
  _id?: string
  videoUrl: string
  title: string
  description: string
  tags: string
  platforms: PlatformResults
  publishedAt: Date
  userId: string
}

export interface PlatformResults {
  [key: string]: PlatformResult
}

export interface PlatformResult {
  success: boolean
  data?: any
  error?: string
}

export interface PublishOptions {
  videoUrl: string
  title: string
  description: string
  tags: string
  platforms: string[]
}

export interface PublishResult {
  overall: boolean
  platforms: PlatformResults
}

export type {
  User,
  Session,
  Scene,
  Character,
  Story,
  StoryRequest,
  StoryReponse,
  AIModel,
  LLMResponse,
  MediaItem,
  Effect
}
