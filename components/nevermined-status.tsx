'use client'

import { useState, useEffect } from 'react'
import { useNevermined } from '@/components/nevermined-provider'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function NeverminedStatus() {
  const {
    payments,
    isInitialized,
    isNeverminedLoggedIn,
    login,
    logout,
    error
  } = useNevermined()

  const [isLoading, setIsLoading] = useState(false)
  const [connectStatus, setConnectStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')

  // Get environment variables safely - using only NEXT_PUBLIC variables which are available on client
  const environment = process.env.NEXT_PUBLIC_NEVERMINED_ENVIRONMENT || 'Not set'
  const agentDid = process.env.NEXT_PUBLIC_NVM_AGENT_DID || 'Not set'
  const planDid = process.env.NEXT_PUBLIC_NVM_PAYMENT_PLAN_DID || 'Not set'

  // Effect to update status message based on Nevermined state
  useEffect(() => {
    if (error) {
      setConnectStatus('error')
      setStatusMessage(`Error: ${error}`)
    } else if (isNeverminedLoggedIn) {
      setConnectStatus('success')
      setStatusMessage('Successfully connected to Nevermined')
    } else if (isInitialized) {
      setConnectStatus('idle')
      setStatusMessage('Nevermined SDK initialized but not logged in')
    } else {
      setConnectStatus('idle')
      setStatusMessage('Nevermined SDK not initialized')
    }
  }, [isInitialized, isNeverminedLoggedIn, error])

  // Handle manual connection test
  const handleTestConnection = async () => {
    setConnectStatus('loading')
    setStatusMessage('Testing Nevermined connection...')
    setIsLoading(true)

    try {
      // Manually trigger login if not already logged in
      if (!isNeverminedLoggedIn) {
        await login()
        setConnectStatus('success')
        setStatusMessage('Successfully connected to Nevermined')
      } else {
        setConnectStatus('success')
        setStatusMessage('Already connected to Nevermined')
      }
    } catch (err) {
      setConnectStatus('error')
      setStatusMessage(`Connection failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true)
    try {
      logout()
      setConnectStatus('idle')
      setStatusMessage('Logged out from Nevermined')
    } catch (err) {
      setConnectStatus('error')
      setStatusMessage(`Logout failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format DIDs for display
  const formatDid = (did: string) => {
    if (!did || did === 'Not set') return did
    return did.length > 20 ? `${did.substring(0, 10)}...${did.substring(did.length - 4)}` : did
  }

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Nevermined Status</h2>
      
      <div className="space-y-4">
        {/* Connection status */}
        <div className="flex items-center space-x-2">
          <span className="font-medium">SDK Initialized:</span>
          <span className="flex items-center">
            {isInitialized ? 
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> : 
              <XCircle className="h-4 w-4 text-red-500 mr-1" />}
            {isInitialized ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-medium">Logged In:</span>
          <span className="flex items-center">
            {isNeverminedLoggedIn ? 
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" /> : 
              <XCircle className="h-4 w-4 text-red-500 mr-1" />}
            {isNeverminedLoggedIn ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="font-medium">Environment:</span>
          <span>{environment}</span>
        </div>

        {/* Status message with appropriate styling */}
        <div className={`p-3 rounded-md ${
          connectStatus === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
          connectStatus === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
          connectStatus === 'loading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          <div className="flex items-center">
            {connectStatus === 'loading' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {connectStatus === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
            {connectStatus === 'error' && <AlertTriangle className="h-4 w-4 mr-2" />}
            <span>{statusMessage}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button 
            onClick={handleTestConnection} 
            disabled={isLoading || (!isInitialized)}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
          
          {isNeverminedLoggedIn && (
            <Button 
              onClick={handleLogout}
              variant="outline"
              disabled={isLoading}
              className="flex-1"
            >
              Logout
            </Button>
          )}
        </div>

        {/* Debug information (optional, can be expanded) */}
        <div className="text-xs text-muted-foreground mt-4">
          <div><strong>Agent DID:</strong> {formatDid(agentDid)}</div>
          <div><strong>Plan DID:</strong> {formatDid(planDid)}</div>
        </div>
      </div>
    </div>
  )
} 