'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNevermined } from '@/components/nevermined-provider'

export default function NeverminedCallback() {
  const router = useRouter()
  const { isInitialized, isNeverminedLoggedIn, error } = useNevermined()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    if (!isInitialized) {
      setStatus('loading')
      setMessage('Initializing Nevermined SDK...')
      return
    }

    if (error) {
      setStatus('error')
      setMessage(`Authentication failed: ${error}`)
      // Redirect after error display
      const timeout = setTimeout(() => {
        router.push('/')
      }, 3000)
      return () => clearTimeout(timeout)
    }

    if (isNeverminedLoggedIn) {
      setStatus('success')
      setMessage('Authentication successful! Redirecting...')
      // Redirect after success
      const timeout = setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [isInitialized, isNeverminedLoggedIn, error, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold">
          {status === 'loading' && 'Completing Authentication'}
          {status === 'success' && 'Authentication Successful'}
          {status === 'error' && 'Authentication Failed'}
        </h1>
        
        <div className="mb-6">
          {status === 'loading' && (
            <div className="flex items-center">
              <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
              <p>{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-green-600">
              <p>{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-red-600">
              <p>{message}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => router.push('/')}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    </div>
  )
} 