'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SignInForm from './sign-in-form'
import SignUpForm from './sign-up-form'

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<string>('signin')

  return (
    <div className='container'>
      <Tabs
        defaultValue='signin'
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full'
      >
        <TabsList className='mb-6 grid w-full grid-cols-2'>
          <TabsTrigger value='signin'>Sign In</TabsTrigger>
          <TabsTrigger value='signup'>Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value='signin'>
          <SignInForm
            onSuccess={() => {}}
            onSignUpClick={() => setActiveTab('signup')}
          />
        </TabsContent>

        <TabsContent value='signup'>
          <SignUpForm
            onSuccess={() => {}}
            onSignInClick={() => setActiveTab('signin')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
