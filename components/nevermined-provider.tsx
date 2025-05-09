'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isEthereumWallet } from '@dynamic-labs/ethereum'
import { Payments, EnvironmentName } from '@nevermined-io/payments'

// Define valid Nevermined environment IDs based on documentation
type NeverminedEnvironmentId = 
  | 'appArbitrum' 
  | 'appBase' 
  | 'appMatic' 
  | 'appGnosis' 
  | 'appOptimism' 
  | 'appCelo' 
  | 'appPeaq'
  | 'staging'
  | 'testing'
  | 'development';

// Define the context type
interface NeverminedContextType {
  payments: Payments | null
  isInitialized: boolean
  isNeverminedLoggedIn: boolean
  credits: number | null
  login: () => Promise<void>
  logout: () => void
  getCreditBalance: () => Promise<number>
  error: string | null
}

// Create the context with default values
const NeverminedContext = createContext<NeverminedContextType>({
  payments: null,
  isInitialized: false,
  isNeverminedLoggedIn: false,
  credits: null,
  login: async () => {},
  logout: () => {},
  getCreditBalance: async () => 0,
  error: null
})

// Provider props
interface NeverminedProviderProps {
  children: ReactNode
}

// Custom Nevermined environment configurations
const NEVERMINED_ENVIRONMENTS = {
  appBase: {
    name: 'appBase',
    backend: 'https://proxy.base.nevermined.app',
    node: 'https://node.base.nevermined.app',
    explorer: 'https://explorer.base.nevermined.app',
    marketplace: 'https://base.nevermined.app',
    faucet: 'https://faucet.base.nevermined.app'
  },
  appArbitrum: {
    name: 'appArbitrum',
    backend: 'https://proxy.arbitrum.nevermined.app',
    node: 'https://node.arbitrum.nevermined.app',
    explorer: 'https://explorer.arbitrum.nevermined.app',
    marketplace: 'https://nevermined.app',
    faucet: 'https://faucet.arbitrum.nevermined.app'
  },
  testing: {
    name: 'testing',
    backend: 'https://proxy.testing.nevermined.app',
    node: 'https://node.testing.nevermined.app',
    explorer: 'https://explorer.testing.nevermined.app',
    marketplace: 'https://testing.nevermined.app',
    faucet: 'https://faucet.testing.nevermined.app'
  }
};

// Helper to map simple environment names to proper Nevermined environment IDs
const mapEnvironmentToId = (env: string): NeverminedEnvironmentId => {
  // Map common environment names to proper environment IDs
  switch (env.toLowerCase()) {
    case 'arbitrum':
      return 'appArbitrum';
    case 'base':
      return 'appBase';
    case 'polygon':
    case 'matic':
      return 'appMatic';
    case 'gnosis':
      return 'appGnosis';
    case 'optimism':
      return 'appOptimism';
    case 'celo':
      return 'appCelo';
    case 'peaq':
      return 'appPeaq';
    case 'staging':
    case 'testing':
    case 'development':
      return env.toLowerCase() as NeverminedEnvironmentId;
    default:
      console.warn(`Unknown environment "${env}", defaulting to "testing"`);
      return 'testing';
  }
};

// Check if we're running in the browser environment
const isBrowser = typeof window !== 'undefined';

// The Nevermined Provider component
export function NeverminedProvider({ children }: NeverminedProviderProps) {
  // Access the Dynamic context to get wallet info
  const { primaryWallet, user } = useDynamicContext()
  
  // Nevermined state
  const [payments, setPayments] = useState<Payments | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isNeverminedLoggedIn, setIsNeverminedLoggedIn] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [initializationAttempted, setInitializationAttempted] = useState(false)

  // Fetch credit balance
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchCreditBalance = async (_paymentsInstance: Payments): Promise<number> => {
    try {
      // In a real implementation, we would fetch the actual credit balance from Nevermined
      // This is a placeholder that you would replace with actual API calls
      // For example: const balance = await _paymentsInstance.getCredits();
      const balance = 0 // Replace with actual API call
      setCredits(balance)
      console.log(`[Nevermined] Credit balance fetched: ${balance}`)
      return balance
    } catch (err) {
      console.error('[Nevermined] Failed to fetch credit balance:', err)
      setError(`Failed to fetch credit balance: ${err instanceof Error ? err.message : String(err)}`)
      return 0
    }
  }

  // Login method
  const login = async () => {
    console.log('[Nevermined] Attempting to login...')
    console.log('[Nevermined] Wallet status:', { 
      primaryWallet: !!primaryWallet,
      address: primaryWallet?.address,
      isEthereum: primaryWallet ? isEthereumWallet(primaryWallet) : false
    })

    if (!payments) {
      const errorMsg = 'Nevermined SDK not initialized'
      console.error(`[Nevermined] ${errorMsg}`)
      setError(errorMsg)
      return
    }

    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      const errorMsg = 'Ethereum wallet not connected'
      console.error(`[Nevermined] ${errorMsg}`)
      setError(errorMsg)
      return
    }

    try {
      // Using Dynamic's authenticated wallet for Nevermined
      // First, ensure the Nevermined SDK knows about the wallet from Dynamic
      // Note: Nevermined SDK handles the wallet internally after connect() is called
      console.log('[Nevermined] Connecting wallet to Nevermined SDK...')
      await payments.connect()
      console.log('[Nevermined] Successfully connected wallet to Nevermined')
      setIsNeverminedLoggedIn(true)
      
      // Fetch credit balance after login
      console.log('[Nevermined] Fetching credit balance...')
      await fetchCreditBalance(payments)
    } catch (err) {
      console.error('[Nevermined] Failed to login to Nevermined:', err)
      setError(`Failed to login to Nevermined: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Initialize Nevermined SDK
  useEffect(() => {
    // Only initialize in the browser environment
    if (!isBrowser) {
      console.log('[Nevermined] Skipping initialization during server-side rendering')
      return
    }

    const initializeNevermined = async () => {
      if (initializationAttempted) {
        return // Prevent multiple initialization attempts
      }
      
      setInitializationAttempted(true)

      try {
        console.log('[Nevermined] Starting SDK initialization...');
        const appId = process.env.NEXT_PUBLIC_NEVERMINED_APP_ID || 'x402-nvm-integration';
        const returnUrl = process.env.NEXT_PUBLIC_NEVERMINED_RETURN_URL || 'http://localhost:3000/callback';
        
        // Try using 'testing' environment which is mentioned in the documentation
        const config = {
          appId,
          returnUrl,
          // Using 'testing' environment which should be pre-configured in the SDK
          environment: 'testing' as EnvironmentName,
          version: 'v1.0.0'
        };
        
        console.log('[Nevermined] Initializing with config:', JSON.stringify(config, null, 2));

        console.log('[Nevermined] Creating SDK instance...');
        // Initialize SDK with the config
        const paymentsInstance = Payments.getBrowserInstance(config);
        
        // Proceed with the rest of the initialization
        console.log('[Nevermined] Calling SDK init()...');
        await paymentsInstance.init();
        console.log('[Nevermined] SDK successfully initialized');
        setPayments(paymentsInstance)
        setIsInitialized(true)

        // Check if already logged in
        if (paymentsInstance.isLoggedIn) {
          console.log('[Nevermined] User is already logged in')
          setIsNeverminedLoggedIn(true)
          // Fetch initial credit balance
          await fetchCreditBalance(paymentsInstance)
        } else {
          console.log('[Nevermined] User not logged in')
        }
      } catch (err) {
        console.error('[Nevermined] Failed to initialize SDK:', err)
        setError(`Failed to initialize Nevermined: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Start initialization
    initializeNevermined()
  }, [initializationAttempted])

  // Authenticate with Nevermined when Dynamic wallet is connected
  useEffect(() => {
    // Only attempt login in browser environment
    if (!isBrowser) return

    const loginWithDynamicWallet = async () => {
      if (
        isInitialized && 
        payments && 
        primaryWallet && 
        user && 
        isEthereumWallet(primaryWallet) && 
        !isNeverminedLoggedIn
      ) {
        console.log('[Nevermined] Dynamic wallet connected, attempting automatic login')
        try {
          await login()
        } catch (err) {
          console.error('[Nevermined] Failed to login with Dynamic wallet:', err)
          setError(`Failed to login with Dynamic wallet: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
    }

    loginWithDynamicWallet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, primaryWallet, user, isNeverminedLoggedIn, payments])

  // Logout method
  const logout = () => {
    if (payments) {
      console.log('[Nevermined] Logging out...')
      payments.logout()
      console.log('[Nevermined] Successfully logged out')
      setIsNeverminedLoggedIn(false)
      setCredits(null)
    } else {
      console.log('[Nevermined] Cannot logout: SDK not initialized')
    }
  }

  // Get credit balance - public method for components to use
  const getCreditBalance = async (): Promise<number> => {
    if (!payments || !isNeverminedLoggedIn) {
      console.log('[Nevermined] Cannot get credits: SDK not initialized or user not logged in')
      return 0
    }
    
    return fetchCreditBalance(payments)
  }

  // Context value
  const contextValue: NeverminedContextType = {
    payments,
    isInitialized,
    isNeverminedLoggedIn,
    credits,
    login,
    logout,
    getCreditBalance,
    error
  }

  return (
    <NeverminedContext.Provider value={contextValue}>
      {children}
    </NeverminedContext.Provider>
  )
}

// Custom hook to use the Nevermined context
export const useNevermined = () => useContext(NeverminedContext) 