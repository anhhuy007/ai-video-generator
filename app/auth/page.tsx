import type { Metadata } from 'next'
import AuthForm from '@/app/auth/components/auth-form'
import { Particles } from '@/components/magicui/particles'
// import VideoBackground from "@/components/ui-elements/video-background"
// import Logo from "@/components/ui-elements/logo"

export const metadata: Metadata = {
  title: 'VideoAI - AI-Powered Video Generation',
  description: 'Generate stunning videos with the power of AI'
}

export default function Home() {
  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white to-slate-100'>
      {/* <VideoBackground /> */}

      <div className='relative z-10 w-full max-w-md px-4 sm:px-0'>
        <div className='mb-8 flex justify-center'>{/* <Logo /> */}</div>

        <div className='rounded-lg border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-md'>
          <AuthForm />
        </div>

        <p className='mt-6 text-center text-sm text-slate-500'>
          By signing up, you agree to our{' '}
          <a href='#' className='text-primary hover:underline'>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href='#' className='text-primary hover:underline'>
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  )
}
