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
  musicStyle: string
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
