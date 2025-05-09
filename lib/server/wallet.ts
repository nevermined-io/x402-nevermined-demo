/**
 * IMPORTANT: SERVER-SIDE ONLY WALLET UTILITY
 * 
 * This file contains private key handling and should NEVER be imported
 * in client-side code. It should only be used in API routes or server components.
 */

import { createWalletClient, http, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

// Environment validation
if (!process.env.PRIVATE_KEY) {
  console.warn('WARNING: Missing PRIVATE_KEY environment variable');
}

// Get the private key from environment variables
// In a real app, you would NEVER expose this on the client
// This should only be used server-side
const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;

/**
 * Creates a wallet client for x402 payments
 * This should only be used server-side
 */
export function createX402WalletClient(): WalletClient | null {
  if (!privateKey) {
    console.error('Cannot create wallet client: Missing PRIVATE_KEY');
    return null;
  }

  try {
    // Create a wallet account from the private key
    const account = privateKeyToAccount(privateKey);
    
    // Create the wallet client
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org')
    });
    
    return walletClient;
  } catch (error) {
    console.error('Failed to create wallet client:', error);
    return null;
  }
}

/**
 * Get the payment recipient address from environment variables
 */
export function getPaymentRecipientAddress(): string {
  return process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT_ADDRESS || 
         '0x0000000000000000000000000000000000000000';
}

/**
 * Get the USDC contract address for Base Sepolia
 */
export function getUsdcContractAddress(): string {
  return process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || 
         '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
}

/**
 * Check if development mode is enabled
 */
export function isDevelopmentMode(): boolean {
  return process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true' || 
         process.env.NODE_ENV === 'development';
}

/**
 * Get the base URL for constructing absolute URLs
 */
export function getBaseUrl(): string {
  // Use VERCEL_URL if available (for production deployments)
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  
  // Otherwise use the configured base URL
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
} 