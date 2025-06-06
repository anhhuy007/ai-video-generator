'use client'

import { signIn } from 'next-auth/react'
import { useState, SVGProps } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
})

type SignInFormValues = z.infer<typeof signInSchema>

interface SignInFormProps {
  onSuccess: () => void
  onSignUpClick: () => void
}

export function Google(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='1em'
      height='1em'
      {...props}
    >
      <path
        fill='currentColor'
        d='M21.594 11.08H12.32v2.746h6.656c-.356 3.812-3.457 5.46-6.462 5.46c-3.813 0-7.205-2.972-7.205-7.27c0-4.135 3.23-7.27 7.205-7.27c3.037 0 4.879 1.971 4.879 1.971l1.874-1.97S16.748 2 12.386 2C6.634 1.968 2.24 6.782 2.24 11.984C2.24 17.024 6.376 22 12.483 22c5.395 0 9.272-3.651 9.272-9.111c.033-1.131-.161-1.81-.161-1.81'
      ></path>
    </svg>
  )
}

export default function SignInForm({
  onSuccess,
  onSignUpClick
}: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit(data: SignInFormValues) {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSuccess()
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold text-slate-900'>Welcome back</h2>
        <p className='text-sm text-slate-500'>
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='you@example.com'
            {...register('email')}
            className='border-slate-200 bg-white'
          />
          {errors.email && (
            <p className='text-xs text-red-500'>{errors.email.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='password'>Password</Label>
            <Button
              variant='link'
              size='sm'
              className='px-0 text-xs text-primary'
            >
              Forgot password?
            </Button>
          </div>
          <Input
            id='password'
            type='password'
            placeholder='••••••••'
            {...register('password')}
            className='border-slate-200 bg-white'
          />
          {errors.password && (
            <p className='text-xs text-red-500'>{errors.password.message}</p>
          )}
        </div>

        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <Separator className='w-full' />
        </div>
        <div className='relative flex justify-center text-xs'>
          <span className='bg-white px-2 text-slate-500'>Or continue with</span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-2'>
        <Button
          variant='outline'
          className='flex items-center gap-2 border-slate-200 bg-white'
          onClick={() => signIn('google')}
        >
          <Google className='h-4 w-4' />
          Google
        </Button>
      </div>

      <div className='text-center text-sm'>
        <span className='text-slate-500'>Don&apos;t have an account?</span>{' '}
        <Button variant='link' className='p-0' onClick={onSignUpClick}>
          Sign up
        </Button>
      </div>
    </div>
  )
}
