import { Story } from '@/app/utils/type'
import { create } from 'zustand'

type GenerationStore = {
  story: Story
  setStory: (story: Story) => void

  images: string[]
  setImages: (images: string[]) => void
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
  setImages: images => set({ images })
}))
