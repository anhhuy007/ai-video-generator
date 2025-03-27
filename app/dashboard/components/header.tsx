'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Bell, Settings, User, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function DashboardHeader() {
  return (
    <header className='flex h-16 items-center justify-between border-b px-4 md:px-6'>
      <div className='flex items-center gap-2'>
        <SidebarTrigger />
        <h1 className='text-xl font-semibold md:text-2xl'>
          AI Video Generator
        </h1>
      </div>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          <Badge className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0'>
            3
          </Badge>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
              <Avatar className='h-8 w-8'>
                <AvatarImage
                  src='/placeholder.svg?height=32&width=32'
                  alt='User'
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>John Doe</p>
                <p className='text-muted-foreground text-xs leading-none'>
                  john.doe@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className='mr-2 h-4 w-4' />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className='mr-2 h-4 w-4' />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
