'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, Share2, Bookmark, MoreHorizontal, Play } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Mock data for generated videos
const mockVideos = [
  {
    id: 1,
    title: 'Futuristic City Flythrough',
    thumbnail:
      'https://media.istockphoto.com/id/1240822408/photo/retro-futuristic-city-flythrough-background-80s-sci-fi-landscape-in-space.jpg?s=170667a&w=0&k=20&c=aJhiRdj_-6l-p9DGq1T-FDctXHzKDEqRpAL1TQcRbMU=',
    date: '2 hours ago',
    duration: '15s'
  },
  {
    id: 2,
    title: 'Ocean Waves at Sunset',
    thumbnail:
      'https://media.istockphoto.com/id/1208302164/photo/frozen-fire.jpg?s=612x612&w=0&k=20&c=YlImqdPSDUPP4clUsAaVFnQ0uRR8omcFg08lmdOC1do=',
    date: 'Yesterday',
    duration: '30s'
  },
  {
    id: 3,
    title: 'Mountain Landscape Timelapse',
    thumbnail:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4liRfwo2Ix3Bu1cv47F8tr9CmuxOkJDvMPg&s',
    date: '3 days ago',
    duration: '20s'
  },
  {
    id: 4,
    title: 'Urban Street Scene',
    thumbnail:
      'https://media.gettyimages.com/id/1475073978/photo/street-in-manhattan-downtown-with-crysler-building-new-york-city-usa.jpg?s=612x612&w=gi&k=20&c=_uQkpVjbShQzUiXCAfat7dgK-05zhjZ6pJhGI7jlYqw=',
    date: '1 week ago',
    duration: '25s'
  },
  {
    id: 5,
    title: 'Abstract Particle Animation',
    thumbnail:
      'https://static.vecteezy.com/system/resources/thumbnails/051/557/680/small_2x/abstract-digital-dynamic-particle-waves-with-light-motion-lights-background-data-flow-cyber-technology-3d-rendering-video.jpg',
    date: '2 weeks ago',
    duration: '10s'
  },
  {
    id: 6,
    title: 'Forest Wildlife Documentary',
    thumbnail: 'https://i.ytimg.com/vi/r3yoBuab-1g/maxresdefault.jpg',
    date: '3 weeks ago',
    duration: '45s'
  }
]

export function VideoGallery() {
  const [filter, setFilter] = useState('all')

  const filteredVideos = filter === 'all' ? mockVideos : mockVideos.slice(0, 3) // Just for demo purposes

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Videos</CardTitle>
        <CardDescription>
          Browse and manage your generated videos
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <Tabs value={filter} onValueChange={setFilter} className='w-full'>
          <TabsList className='grid w-full max-w-md grid-cols-3'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='recent'>Recent</TabsTrigger>
            <TabsTrigger value='saved'>Saved</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredVideos.map(video => (
            <div
              key={video.id}
              className='group relative overflow-hidden rounded-lg border bg-card'
            >
              <div className='relative aspect-video overflow-hidden'>
                <img
                  src={video.thumbnail || '/placeholder.svg'}
                  alt={video.title}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
                <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100'>
                  <Button
                    size='icon'
                    variant='secondary'
                    className='h-12 w-12 rounded-full'
                  >
                    <Play className='h-6 w-6' />
                  </Button>
                </div>
                <div className='absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white'>
                  {video.duration}
                </div>
              </div>
              <div className='p-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-medium'>{video.title}</h3>
                    <p className='text-xs text-muted-foreground'>
                      {video.date}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem className='flex items-center gap-2'>
                        <Download className='h-4 w-4' />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='flex items-center gap-2'>
                        <Share2 className='h-4 w-4' />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='flex items-center gap-2'>
                        <Bookmark className='h-4 w-4' />
                        <span>Save</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className='flex h-40 flex-col items-center justify-center rounded-lg border border-dashed'>
            <p className='text-muted-foreground'>No videos found</p>
            <Button variant='link' className='mt-2'>
              Generate your first video
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
