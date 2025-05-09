"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";
import { useX402Payment } from "@/hooks/useX402";

// Define proper types instead of using any
interface PaymentResult {
  title?: string;
  content?: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface DebugInformation {
  time?: string;
  isReadyState?: boolean;
  wallet?: string | null;
  environment?: string;
  crypto?: object | string;
  lastTransaction?: {
    hash?: string;
    status?: string;
    network?: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

export function X402DirectTest() {
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInformation>({});
  
  const { 
    makePayment, 
    testDevPayment, 
    isReady, 
    walletAddress,
    debugInfo: hookDebugInfo 
  } = useX402Payment();

  // Collect debug information
  useEffect(() => {
    async function gatherDebugInfo() {
      setDebugInfo({
        time: new Date().toISOString(),
        isReadyState: isReady,
        wallet: walletAddress,
        environment: process.env.NODE_ENV,
        crypto: typeof window !== 'undefined' ? {
          cryptoAvailable: !!window.crypto,
          getRandomValuesAvailable: !!(window.crypto && window.crypto.getRandomValues),
        } : 'SSR',
      });
    }
    
    gatherDebugInfo();
  }, [isReady, walletAddress, hookDebugInfo]);

  const handleRealPayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[Test] Attempting real payment transaction...');
      // Pass false to avoid using development bypass
      const data = await makePayment('/api/premium-content', false);
      setResult(data);
      console.log('Payment successful:', data);
    } catch (err) {
      console.error('Payment failed:', err);
      // Show more detailed error information
      if (err instanceof Error) {
        // Check for common errors and provide more friendly messages
        if (err.message.includes('exceeds balance')) {
          setError('Insufficient USDC balance on Base Sepolia. You need to get some testnet USDC to make this payment.');
        } else if (err.message.includes('User rejected')) {
          setError('Transaction was rejected in your wallet.');
        } else {
          setError(`${err.name}: ${err.message}`);
        }
        console.error('Error stack:', err.stack);
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectPayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[Test] Attempting direct payment...');
      // Use development bypass by default
      const data = await makePayment('/api/premium-content', true);
      setResult(data);
      console.log('Payment successful:', data);
    } catch (err) {
      console.error('Payment failed:', err);
      // Show more detailed error information
      if (err instanceof Error) {
        setError(`${err.name}: ${err.message}`);
        console.error('Error stack:', err.stack);
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified handler that directly uses makePayment with the bypass parameter
  const handleDevBypass = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[Test] Attempting dev bypass...');
      // Just call makePayment directly with bypass=true
      const data = await makePayment('/api/premium-content', true);
      setResult(data);
      console.log('Bypass successful:', data);
    } catch (err) {
      console.error('Bypass failed:', err);
      // Show more detailed error information
      if (err instanceof Error) {
        setError(`${err.name}: ${err.message}`);
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[Test] Attempting test payment...');
      const data = await testDevPayment();
      setResult(data);
      console.log('Test payment successful:', data);
    } catch (err) {
      console.error('Test payment failed:', err);
      // Show more detailed error information
      if (err instanceof Error) {
        setError(`${err.name}: ${err.message}`);
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white/5 backdrop-blur-md border rounded-lg">
      <h2 className="text-xl font-bold mb-4">X402 Direct Payment Test</h2>
      
      <div className="mb-4 p-2 bg-gray-800 rounded text-sm">
        <p><strong>Wallet address:</strong> {walletAddress || 'Not connected'}</p>
        <p><strong>Ready for payments:</strong> {isReady ? 'Yes' : 'No'}</p>
        <p className="mt-2 text-xs text-amber-400">
          <strong>Note:</strong> To make real payments, you need USDC on Base Sepolia testnet.
          You can get test USDC from the <a href="https://www.coinbase.com/faucets/base-sepolia-faucet" target="_blank" rel="noopener noreferrer" className="underline">Base Sepolia Faucet</a>.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3 mb-6">
        <Button 
          onClick={handleRealPayment}
          disabled={isLoading || !isReady}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Processing...' : 'Make Real x402 Payment (Testnet)'}
        </Button>

        <Button 
          onClick={handleDirectPayment}
          disabled={isLoading || !isReady}
          className="w-full"
        >
          {isLoading ? 'Processing...' : 'Make x402 Payment (Development Bypass)'}
        </Button>
        
        <Button 
          onClick={handleDevBypass}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          Use Development Bypass
        </Button>
        
        <Button 
          onClick={handleTestPayment}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          Test with Headers
        </Button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 text-red-300 rounded-lg">
          <h3 className="font-bold mb-1">Error</h3>
          <p className="text-sm font-mono whitespace-pre-wrap">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">Payment Successful</h3>
          <pre className="text-xs bg-gray-800/50 p-3 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="font-bold mb-2">Debug Information</h3>
        <pre className="text-xs bg-gray-800/50 p-3 rounded overflow-auto">
          {JSON.stringify({
            ...debugInfo,
            lastTransaction: hookDebugInfo?.lastTransaction || null
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
} 