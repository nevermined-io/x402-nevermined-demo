'use client'

import { useState, useEffect } from 'react'
import { useNevermined } from './nevermined-provider'
import { useX402Payment } from '@/hooks/useX402'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

// Credit package options
const CREDIT_PACKAGES = [
  { id: 'small', name: 'Basic', credits: 50, price: 0.5, amount: '500000' },
  { id: 'medium', name: 'Standard', credits: 200, price: 1.0, amount: '1000000' },
  { id: 'large', name: 'Premium', credits: 500, price: 2.0, amount: '2000000' },
]

// Check if we're running in browser
const isBrowser = typeof window !== 'undefined';

export default function NeverminedCreditPurchase() {
  const { isNeverminedLoggedIn, credits: currentCredits, getCreditBalance } = useNevermined()
  const { makePayment, isReady, loading, error: x402Error } = useX402Payment()
  
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[0])
  const [customAmount, setCustomAmount] = useState('1')
  const [isCustom, setIsCustom] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [purchasedCredits, setPurchasedCredits] = useState(0)

  // Load current credit balance
  useEffect(() => {
    if (!isBrowser) return; // Skip during SSR
    
    if (isNeverminedLoggedIn) {
      getCreditBalance()
    }
  }, [isNeverminedLoggedIn, getCreditBalance])

  // Reset error state when x402Error changes
  useEffect(() => {
    if (!isBrowser) return; // Skip during SSR
    
    if (x402Error) {
      setStatus('error')
      setErrorMessage(x402Error)
    }
  }, [x402Error])

  // Handle credit package selection
  const handlePackageSelect = (pkg: typeof CREDIT_PACKAGES[0]) => {
    setSelectedPackage(pkg)
    setIsCustom(false)
  }

  // Handle custom amount selection
  const handleCustomSelect = () => {
    setIsCustom(true)
  }

  // Handle custom amount change
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setCustomAmount(value)
    }
  }

  // Handle credit purchase
  const handlePurchase = async () => {
    try {
      setStatus('loading')
      setErrorMessage('')

      // Calculate the amount based on selection
      const amount = isCustom
        ? (parseFloat(customAmount) * 1_000_000).toString() // Convert USDC to smallest unit
        : selectedPackage.amount

      // Use x402 to make the payment
      console.log(`[NevCreditPurchase] Making payment with amount ${amount}...`)
      const result = await makePayment(`/api/nevermined-credits?amount=${amount}`, false)
      
      if (result && result.success) {
        console.log(`[NevCreditPurchase] Payment successful, credits: ${result.data.credits}`)
        setStatus('success')
        setPurchasedCredits(result.data.credits)
        
        // Refresh credit balance
        await getCreditBalance()
      } else {
        console.error(`[NevCreditPurchase] Payment processed but credit allocation failed`)
        setStatus('error')
        setErrorMessage('Payment was processed but credit allocation failed')
      }
    } catch (err) {
      console.error(`[NevCreditPurchase] Credit purchase failed:`, err)
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred')
    }
  }

  // For development testing
  const handleDevPurchase = async () => {
    try {
      setStatus('loading')
      setErrorMessage('')

      // Calculate the amount based on selection
      const amount = isCustom
        ? (parseFloat(customAmount) * 1_000_000).toString()
        : selectedPackage.amount

      // Use x402 dev bypass for testing
      console.log(`[NevCreditPurchase] Making dev bypass payment with amount ${amount}...`)
      const result = await makePayment(`/api/nevermined-credits?amount=${amount}`, true)
      
      if (result && result.success) {
        console.log(`[NevCreditPurchase] Dev payment successful, credits: ${result.data.credits}`)
        setStatus('success')
        setPurchasedCredits(result.data.credits)
        
        // Refresh credit balance
        await getCreditBalance()
      } else {
        console.error(`[NevCreditPurchase] Dev payment processed but credit allocation failed`)
        setStatus('error')
        setErrorMessage('Payment was processed but credit allocation failed')
      }
    } catch (err) {
      console.error(`[NevCreditPurchase] Dev credit purchase failed:`, err)
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred')
    }
  }

  // Reset the form
  const handleReset = () => {
    setStatus('idle')
    setErrorMessage('')
    setPurchasedCredits(0)
  }

  return (
    <div className="w-full max-w-md rounded-lg border p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Purchase AI Credits</h2>
      
      {/* Current credits display */}
      <div className="mb-6 rounded bg-gray-100 p-3 dark:bg-gray-800">
        <Label>Current Balance</Label>
        <div className="text-2xl font-bold">{currentCredits ?? 0} Credits</div>
      </div>

      {/* Status message display */}
      {status === 'success' && (
        <div className="mb-6 rounded-md bg-green-100 p-4 text-green-800 dark:bg-green-900 dark:text-green-100">
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Successfully purchased {purchasedCredits} credits!</span>
          </div>
          <Button className="mt-3 w-full" onClick={handleReset}>Make Another Purchase</Button>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-6 rounded-md bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-100">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>Error: {errorMessage}</span>
          </div>
          <Button className="mt-3 w-full" onClick={handleReset} variant="destructive">Try Again</Button>
        </div>
      )}

      {/* Credit package selection */}
      {status === 'idle' && (
        <>
          <div className="mb-4">
            <Label>Select Credit Package</Label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {CREDIT_PACKAGES.map(pkg => (
                <Button
                  key={pkg.id}
                  type="button"
                  variant={selectedPackage.id === pkg.id && !isCustom ? "default" : "outline"}
                  className="flex h-auto flex-col items-center justify-center p-3"
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <span className="font-bold">{pkg.name}</span>
                  <span className="text-xl font-bold">{pkg.credits}</span>
                  <span className="text-sm text-muted-foreground">${pkg.price.toFixed(2)}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount option */}
          <div className="mb-6">
            <Label htmlFor="custom-amount">Custom Amount</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id="custom-amount"
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Enter USDC amount"
                className={isCustom ? "border-primary" : ""}
                onClick={handleCustomSelect}
              />
              <Button
                type="button"
                variant={isCustom ? "default" : "outline"}
                onClick={handleCustomSelect}
              >
                Custom
              </Button>
            </div>
            {isCustom && (
              <p className="mt-1 text-sm text-muted-foreground">
                You will receive approximately {Math.floor(parseFloat(customAmount || '0') * 10)} credits
              </p>
            )}
          </div>

          {/* Purchase button */}
          <div className="space-y-2">
            <Button
              onClick={handlePurchase}
              disabled={loading || !isReady || (!isCustom && !selectedPackage) || (isCustom && (!customAmount || parseFloat(customAmount) <= 0))}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Purchase with USDC
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDevPurchase}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Test Purchase (Dev Mode)
            </Button>
          </div>
        </>
      )}
    </div>
  )
} 