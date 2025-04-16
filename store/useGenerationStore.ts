import { Story } from '@/app/utils/type';
import {create} from 'zustand';

type GenerationStore = {
    story: Story;
    setStory: (story: Story) => void;
};

export const useGenerationStore = create<GenerationStore>((set) => ({
    story: {
        prompt: '',
        scenesCount: 0,
        scenes: [],
        characters: [],
        theme: ''
    },
    setStory: (story) => set({ story })
}));