'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
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
      console.log('Sign in data:', data)
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
          className='border-slate-200 bg-white'
          onClick={() => signIn('google')}
        >
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
