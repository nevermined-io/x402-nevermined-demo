"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useState, useEffect } from "react";
import { Button } from "./button";

interface X402DebugProps {
  show: boolean;
}

export function X402Debug({ show }: X402DebugProps) {
  const { primaryWallet, user } = useDynamicContext();
  const [cryptoWorks, setCryptoWorks] = useState<boolean | null>(null);
  const [randomValuesWorks, setRandomValuesWorks] = useState<boolean | null>(null);
  const [envInfo, setEnvInfo] = useState<{ [key: string]: string | boolean }>({});
  
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined') {
      // Check if crypto is available
      const cryptoExists = !!window.crypto;
      const randomValuesExists = cryptoExists && !!window.crypto.getRandomValues;
      
      setCryptoWorks(cryptoExists);
      setRandomValuesWorks(randomValuesExists);
      
      // Test the crypto API
      if (randomValuesExists) {
        try {
          const testArray = new Uint8Array(16);
          window.crypto.getRandomValues(testArray);
        } catch (error) {
          console.error('Crypto test failed:', error);
        }
      }
      
      // Collect environment information
      setEnvInfo({
        environment: process.env.NODE_ENV || 'unknown',
        isDevelopment: process.env.NODE_ENV === 'development',
        isDevelopmentMode: process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true',
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || window.location.origin,
        usdcContract: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || 'Not defined',
        recipientAddress: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || 'Not defined',
        cryptoExists,
        randomValuesExists,
      });
    }
  }, []);
  
  if (!show) return null;
  
  const isAuthenticated = !!user;
  const isWalletConnected = !!primaryWallet;
  const isEthereum = primaryWallet ? isEthereumWallet(primaryWallet) : false;
  
  // Test the crypto polyfill
  const testCryptoPolyfill = () => {
    try {
      if (typeof window !== 'undefined' && window.crypto) {
        const testArray = new Uint8Array(8);
        window.crypto.getRandomValues(testArray);
        console.log('Crypto test array:', Array.from(testArray));
        alert('Crypto polyfill test successful! Check console for values.');
      } else {
        alert('Crypto API not available.');
      }
    } catch (err) {
      console.error('Crypto polyfill test error:', err);
      alert(`Crypto polyfill test failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="mt-4 w-full max-w-md p-4 bg-neutral-50 dark:bg-neutral-900 border rounded-md text-xs font-mono">
      <h3 className="text-sm font-bold mb-2">x402 Debug Info</h3>
      <div className="space-y-1">
        <section className="mb-3">
          <h4 className="font-semibold mb-1">Wallet Status</h4>
          <div className="flex justify-between">
            <span>Connected:</span>
            <span className={isWalletConnected ? "text-green-600" : "text-red-600"}>
              {isWalletConnected ? "Yes" : "No"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Authenticated:</span>
            <span className={isAuthenticated ? "text-green-600" : "text-red-600"}>
              {isAuthenticated ? "Yes" : "No"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Ethereum Compatible:</span>
            <span className={isEthereum ? "text-green-600" : "text-red-600"}>
              {isEthereum ? "Yes" : "No"}
            </span>
          </div>
          
          {primaryWallet && (
            <>
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-blue-600">
                  {`${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Chain:</span>
                <span>{primaryWallet.chain}</span>
              </div>
            </>
          )}
        </section>
        
        <section className="mb-3">
          <h4 className="font-semibold mb-1">Crypto API Status</h4>
          <div className="flex justify-between">
            <span>Available:</span>
            <span className={cryptoWorks ? "text-green-600" : "text-red-600"}>
              {cryptoWorks === null ? "Checking..." : cryptoWorks ? "Yes" : "No"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>getRandomValues:</span>
            <span className={randomValuesWorks ? "text-green-600" : "text-red-600"}>
              {randomValuesWorks === null ? "Checking..." : randomValuesWorks ? "Yes" : "No"}
            </span>
          </div>
          
          <div className="mt-2">
            <Button 
              onClick={testCryptoPolyfill}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              Test Crypto Polyfill
            </Button>
          </div>
        </section>
        
        <section>
          <h4 className="font-semibold mb-1">Configuration</h4>
          <div className="mt-1 space-y-1 bg-black/5 dark:bg-white/5 p-2 rounded text-[10px]">
            {Object.entries(envInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span>{key}:</span>
                <span className="font-bold">{String(value)}</span>
              </div>
            ))}
          </div>
        </section>
        
        <div className="text-xs text-muted-foreground mt-2">
          <p>
            <strong>Note:</strong> If getRandomValues is not working, try running without Turbopack: <code>pnpm dev</code> instead of <code>pnpm dev:turbo</code>
          </p>
        </div>
      </div>
    </div>
  );
} 