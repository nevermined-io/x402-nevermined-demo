"use client";

import { ReactNode } from "react";
import {
  DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

// Define Base Sepolia network for x402 payments
const baseSepolia = {
  blockExplorerUrls: ["https://sepolia.basescan.org/"],
  chainId: 84532,
  chainName: "Base Sepolia",
  iconUrls: ["https://app.dynamic.xyz/assets/networks/base.svg"],
  name: "Base Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
    iconUrl: "https://app.dynamic.xyz/assets/networks/base.svg",
  },
  networkId: 84532,
  rpcUrls: ["https://sepolia.base.org"],
  vanityName: "Base Sepolia",
};

interface DynamicProviderProps {
  children: ReactNode;
}

export default function DynamicProvider({ children }: DynamicProviderProps) {
  const isDev = process.env.NODE_ENV === "development";
  
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        
        // Use Ethereum wallet connectors (includes Base)
        walletConnectors: [EthereumWalletConnectors],
        
        // Enable debug mode during development
        debugError: isDev,
        
        // Add Base Sepolia network for x402 payments
        overrides: {
          evmNetworks: [baseSepolia]
        },
        
        // Simplified event handlers - only log in development
        events: isDev ? {
          onAuthSuccess: () => console.log("[Dynamic] Authentication successful"),
          onLogout: () => console.log("[Dynamic] User logged out"),
        } : undefined,
      }}
    >
      {children}
    </DynamicContextProvider>
  );
} 