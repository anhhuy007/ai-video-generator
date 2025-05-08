import { signIn } from 'next-auth/react'
import { Story } from '@/app/utils/type'
import { create } from 'zustand'

type GenerationStore = {
  story: Story
  setStory: (story: Story) => void

  images: string[]
  setImages: (images: string[]) => void

  mp3_url: string[]
  setMp3Url: (mp3_url: string[]) => void

  video_url: string
  setVideoUrl: (video_url: string) => void
}

export const useGenerationStore = create<GenerationStore>(set => ({
  story: {
    prompt: '',
    scenesCount: 0,
    scenes: [],
    characters: [],
    theme: ''
  },
  setStory: story => set({ story }),

  images: [],
  setImages: images => set({ images }),

  mp3_url: [],
  setMp3Url: mp3_url => set({ mp3_url }),

  video_url:
    'https://res.cloudinary.com/dprxfw51q/video/upload/v1746498980/video_gen_ai/pghegtvhh54ya01ecbdo.mp4',
  setVideoUrl: video_url => set({ video_url })
}))
