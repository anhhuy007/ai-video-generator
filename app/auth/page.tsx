'use client'

import { use, useEffect } from 'react'
import SignInForm from './components/sign-in-form'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AuthenticationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/')
    }
  }, [status, router])

  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-white to-slate-100'>
      <div className='relative z-10 w-full max-w-md px-4 sm:px-0'>
        <div className='mb-8 flex justify-center'>{/* <Logo /> */}</div>

        <div className='rounded-lg border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-md'>
          <SignInForm
            onSuccess={() => {
              router.push('/')
            }}
            onSignUpClick={() => {}}
          />
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
