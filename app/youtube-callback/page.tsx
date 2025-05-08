'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, CircularProgress, Typography, Alert } from '@mui/material'

export default function YouTubeCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(`Authorization failed: ${error}`)
      return
    }

    if (!code) return

    const processAuthCode = async () => {
      try {
        const response = await fetch('/api/youtube/auth-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })

        const data = await response.json()

        if (data.success) {
          // Save tokens to sessionStorage (for development use only)
          sessionStorage.setItem('youtubeTokens', JSON.stringify(data.tokens))

          // If this is a popup window, send the tokens back to the main window
          if (window.opener) {
            window.opener.postMessage(
              { youtubeTokens: data.tokens },
              window.location.origin
            )
            window.close()
          } else {
            // If not a popup, redirect back to the original page
            setStatus('success')
            setMessage('Authorization successful! Redirecting...')

            const redirectUrl =
              sessionStorage.getItem('youtubeAuthRedirect') || '/dashboard'
            sessionStorage.removeItem('youtubeAuthRedirect')

            setTimeout(() => {
              router.push(redirectUrl)
            }, 1500)
          }
        } else {
          throw new Error(data.message)
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(`Failed to process authentication: ${error.message}`)
      }
    }

    processAuthCode()
  }, [router, searchParams])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 4
      }}
    >
      {status === 'loading' && (
        <>
          <CircularProgress size={60} thickness={4} />
          <Typography variant='h6' sx={{ mt: 3 }}>
            {message}
          </Typography>
        </>
      )}

      {status === 'success' && (
        <Alert severity='success' sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  )
}
