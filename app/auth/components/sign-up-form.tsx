'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Github, Loader2 } from 'lucide-react'

const signUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
})

type SignUpFormValues = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  onSuccess: () => void
  onSignInClick: () => void
}

export default function SignUpForm({
  onSuccess,
  onSignInClick
}: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      acceptTerms: false
    }
  })

  const acceptTerms = watch('acceptTerms')

  async function onSubmit(data: SignUpFormValues) {
    setIsLoading(true)

    try {
      // Here you would implement your registration logic
      console.log('Sign up data:', data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      onSuccess()
    } catch (error) {
      console.error('Sign up error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold text-slate-900 dark:text-white'>
          Create an account
        </h2>
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          Enter your information to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Full Name</Label>
          <Input
            id='name'
            placeholder='John Doe'
            {...register('name')}
            className='border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
          />
          {errors.name && (
            <p className='text-xs text-red-500'>{errors.name.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='you@example.com'
            {...register('email')}
            className='border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
          />
          {errors.email && (
            <p className='text-xs text-red-500'>{errors.email.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            placeholder='••••••••'
            {...register('password')}
            className='border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
          />
          {errors.password && (
            <p className='text-xs text-red-500'>{errors.password.message}</p>
          )}
        </div>

        <div className='flex items-start space-x-2'>
          <Checkbox
            id='acceptTerms'
            checked={acceptTerms}
            onCheckedChange={(checked: boolean) =>
              setValue('acceptTerms', checked as boolean)
            }
          />
          <Label htmlFor='acceptTerms' className='text-sm leading-tight'>
            I agree to the{' '}
            <a href='#' className='text-primary hover:underline'>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href='#' className='text-primary hover:underline'>
              Privacy Policy
            </a>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className='text-xs text-red-500'>{errors.acceptTerms.message}</p>
        )}

        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <Separator className='w-full' />
        </div>
        <div className='relative flex justify-center text-xs'>
          <span className='bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400'>
            Or continue with
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-2'>
        <Button
          variant='outline'
          className='border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
        >
          <Github className='mr-2 h-4 w-4' />
          GitHub
        </Button>
      </div>

      <div className='text-center text-sm'>
        <span className='text-slate-500 dark:text-slate-400'>
          Already have an account?
        </span>{' '}
        <Button variant='link' className='p-0' onClick={onSignInClick}>
          Sign in
        </Button>
      </div>
    </div>
  )
}
