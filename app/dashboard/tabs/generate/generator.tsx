import type React from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, Film, Mic, Pencil, PlayCircle, Upload } from 'lucide-react'

export function VideoGenerator() {
  return (
    <Card>
      <div className='container mx-auto px-4 py-12'>
        <div className='mb-12 text-center'>
          <h1 className='mb-4 text-4xl font-bold tracking-tight'>
            AI Video Generator Pipeline
          </h1>
          <p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
            Create stunning AI-generated videos with our comprehensive pipeline.
            From script to publishing, we've got you covered.
          </p>
          <div className='mt-8'>
            <Button asChild size='lg'>
              <Link href='/create'>
                Start Creating <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </div>
        </div>

        <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <FeatureCard
            icon={<Pencil className='h-8 w-8' />}
            title='Literary Content Creation'
            description='Generate scripts with AI assistance. Choose content styles and edit before proceeding.'
          />
          <FeatureCard
            icon={<Mic className='h-8 w-8' />}
            title='Voice Configuration'
            description='Select from multiple AI voice providers. Adjust speed, tone, and preview before applying.'
          />
          <FeatureCard
            icon={<Film className='h-8 w-8' />}
            title='AI Image & Video Generation'
            description='Generate and customize images. Create videos with motion effects and transitions.'
          />
          <FeatureCard
            icon={<PlayCircle className='h-8 w-8' />}
            title='Advanced Video Editing'
            description='Drag and drop interface for timeline editing. Add animations, music, and subtitles.'
          />
          <FeatureCard
            icon={<Upload className='h-8 w-8' />}
            title='Publishing & Management'
            description='Choose resolution and publish to multiple platforms. Manage your video library.'
          />
          <Card className='flex items-center justify-center border-2 border-dashed p-6'>
            <div className='text-center'>
              <h3 className='mb-2 text-lg font-medium'>
                Ready to get started?
              </h3>
              <Button asChild>
                <Link href='/generate'>Create New Video</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  )
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className='mb-2 text-primary'>{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className='text-sm'>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
