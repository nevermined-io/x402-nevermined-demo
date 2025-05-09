/**
 * Client-side x402 payment hook
 * 
 * This hook provides x402 payment capabilities with direct fetch API
 * instead of relying on axios or x402-axios packages.
 */

import { useEffect, useState, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { createPublicClient, encodeFunctionData, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import '../lib/crypto-polyfill';

// ERC-20 ABI needed for the transfer function
const erc20Abi = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Define types for our debug info
interface DebugInfo {
  wallet?: {
    address?: string;
    connected?: boolean;
  } | null;
  environment?: string;
  crypto?: {
    cryptoAvailable?: boolean;
    getRandomValuesAvailable?: boolean;
  } | 'SSR';
  timestamp?: string;
  lastTransaction?: {
    hash?: string;
    status?: string;
    network?: string;
  } | null;
}

// Define types for x402 protocol objects
interface X402PaymentDetails {
  x402Version: number;
  accepts: Array<{
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: {
      name?: string;
      symbol?: string;
      decimals?: number;
    } | null;
  }>;
}

// Define the return type for the hook
interface X402PaymentHook {
  makePayment: (url: string, useDevelopmentBypass?: boolean) => Promise<any>;
  testDevPayment: () => Promise<any>;
  isReady: boolean;
  error: string | null;
  loading: boolean;
  data: any;
  walletAddress: string | null;
  debugInfo: DebugInfo;
}

// Simple and direct implementation using native fetch
export function useX402Payment(): X402PaymentHook {
  const { primaryWallet, user } = useDynamicContext();
  const [walletClient, setWalletClient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});

  // Set up wallet when user is connected
  useEffect(() => {
    async function setupWallet() {
      // Only run if we don't already have a wallet client but do have a primary wallet
      if (!walletClient && primaryWallet && user && isEthereumWallet(primaryWallet)) {
        try {
          console.log('[x402] Using wallet from Dynamic:', primaryWallet.address);
          const dynamicWalletClient = await primaryWallet.getWalletClient();
          
          if (dynamicWalletClient) {
            console.log('[x402] Using account:', dynamicWalletClient.account.address);
            setWalletClient(dynamicWalletClient);
            
            // Update debug info with wallet details
            setDebugInfo((prevInfo: DebugInfo) => ({
              ...prevInfo,
              wallet: {
                address: dynamicWalletClient.account.address,
                connected: true
              },
              timestamp: new Date().toISOString()
            }));
          } else {
            setError('Could not get wallet client');
          }
        } catch (err) {
          console.error('Error getting Dynamic wallet client:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    }

    setupWallet();
  }, [primaryWallet, user, walletClient]);

  // Function to make a payment request
  const makePayment = useCallback(async (url: string, useDevelopmentBypass: boolean = false) => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      if (!walletClient) {
        throw new Error('Wallet client not initialized');
      }
      
      console.log('[x402] Making payment to:', url);
      
      // Make sure the URL is absolute
      const absoluteUrl = url.startsWith('http') 
        ? url 
        : window.location.origin + (url.startsWith('/') ? url : `/${url}`);
      
      // First, make a request to get the payment requirements
      console.log('[x402] Step 1: Getting payment requirements...');
      
      // Use native fetch API instead of axios
      const initialResponse = await fetch(absoluteUrl);
      
      // If we got a 200 response directly, return it (maybe it's free or already paid?)
      if (initialResponse.ok) {
        console.log('[x402] Resource available without payment!');
        const responseData = await initialResponse.json();
        setData(responseData);
        return responseData;
      }
      
      // Check for 402 Payment Required status
      if (initialResponse.status !== 402) {
        throw new Error(`Unexpected response status: ${initialResponse.status}`);
      }
      
      const paymentDetails = await initialResponse.json() as X402PaymentDetails;
      console.log('[x402] Step 2: Processing 402 Payment Required...');
      console.log('[x402] Payment details:', paymentDetails);
      
      // If development bypass is requested, use it instead of real payment
      if (useDevelopmentBypass) {
        console.log('[x402] Using development bypass instead of real payment');
        const bypassResponse = await fetch(`${absoluteUrl}?bypass=true`);
        
        if (!bypassResponse.ok) {
          throw new Error(`Bypass request failed with status ${bypassResponse.status}`);
        }
        
        // Handle successful response
        const bypassData = await bypassResponse.json();
        console.log('[x402] Payment successful!');
        setData(bypassData);
        return bypassData;
      }
      
      // Check that we have valid payment details
      if (!paymentDetails.accepts || paymentDetails.accepts.length === 0) {
        throw new Error('No payment options available');
      }
      
      // Use the first payment option for now
      const paymentOption = paymentDetails.accepts[0];
      
      // Validate the payment option
      if (paymentOption.network !== 'base-sepolia') {
        throw new Error(`Unsupported network: ${paymentOption.network}`);
      }
      
      if (paymentOption.scheme !== 'exact') {
        throw new Error(`Unsupported payment scheme: ${paymentOption.scheme}`);
      }
      
      // Extract payment details
      const tokenAddress = paymentOption.asset as `0x${string}`;
      const recipientAddress = paymentOption.payTo as `0x${string}`;
      const amount = paymentOption.maxAmountRequired;
      const decimals = paymentOption.extra?.decimals || 6; // Default to 6 for USDC
      
      console.log('[x402] Step 3: Making real payment...');
      console.log('[x402] Token address:', tokenAddress);
      console.log('[x402] Recipient address:', recipientAddress);
      console.log('[x402] Amount:', amount);
      
      // Create the transaction data for ERC-20 transfer
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipientAddress, BigInt(amount)]
      });
      
      // Send the transaction
      console.log('[x402] Step 4: Sending transaction...');
      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipientAddress, BigInt(amount)],
        chain: baseSepolia,
      });
      
      console.log('[x402] Transaction hash:', hash);
      
      // Update debug info
      setDebugInfo((prevInfo: DebugInfo) => ({
        ...prevInfo,
        lastTransaction: {
          hash: hash,
          status: 'sent',
          network: 'base-sepolia'
        },
        timestamp: new Date().toISOString()
      }));
      
      // Create a public client to wait for the transaction
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
      });
      
      // Wait for the transaction to be mined
      console.log('[x402] Step 5: Waiting for transaction confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      console.log('[x402] Transaction confirmed:', receipt);
      
      // Update transaction status in debug info
      setDebugInfo((prevInfo: DebugInfo) => ({
        ...prevInfo,
        lastTransaction: {
          ...prevInfo.lastTransaction,
          status: receipt.status === 'success' ? 'confirmed' : 'failed'
        },
        timestamp: new Date().toISOString()
      }));
      
      if (receipt.status !== 'success') {
        throw new Error('Transaction failed');
      }
      
      // Create the payment header
      const paymentHeader = Buffer.from(JSON.stringify({
        from: walletClient.account?.address,
        to: recipientAddress,
        asset: tokenAddress,
        amount: amount,
        tx: hash,
        network: 'base-sepolia'
      })).toString('base64');
      
      // Make the request again with the payment header
      console.log('[x402] Step 6: Accessing content with payment proof...');
      const paymentResponse = await fetch(absoluteUrl, {
        headers: {
          'X-PAYMENT': paymentHeader
        }
      });
      
      if (!paymentResponse.ok) {
        throw new Error(`Payment verification failed with status ${paymentResponse.status}`);
      }
      
      // Handle successful response
      const responseData = await paymentResponse.json();
      console.log('[x402] Payment successful!');
      setData(responseData);
      return responseData;
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletClient]);

  /**
   * Development utility to test with headers
   */
  const testDevPayment = useCallback(async () => {
    try {
      // Use native fetch API with header
      const response = await fetch('/api/premium-content', {
        headers: {
          'X-DEV-BYPASS-PAYMENT': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Test payment request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[x402] Test payment response:', result);
      setData(result);
      return result;
    } catch (err) {
      console.error('[x402] Test payment failed:', err);
      throw err;
    }
  }, []);

  // Get updated environment and debug information
  useEffect(() => {
    function updateDebugInfo() {
      setDebugInfo((prevInfo: DebugInfo) => ({
        ...prevInfo,
        environment: process.env.NODE_ENV,
        crypto: typeof window !== 'undefined' ? {
          cryptoAvailable: !!window.crypto,
          getRandomValuesAvailable: !!(window.crypto && window.crypto.getRandomValues),
        } : 'SSR',
        wallet: walletClient ? {
          address: walletClient.account?.address || 'unknown',
          connected: !!walletClient
        } : null,
        timestamp: new Date().toISOString()
      }));
    }
    
    updateDebugInfo();
  }, [walletClient?.account?.address]);

  return {
    makePayment,
    testDevPayment,
    isReady: !!walletClient,
    error,
    loading,
    data,
    walletAddress: primaryWallet?.address || null,
    debugInfo
  };
} 