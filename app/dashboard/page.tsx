"use client";

import { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { X402Debug } from "@/components/ui/X402Debug";
import { X402DirectTest } from "@/components/ui/X402DirectTest";
import NeverminedCreditPurchase from "@/components/nevermined-credit-purchase";
import NeverminedStatus from "@/components/nevermined-status";
import Link from "next/link";

export default function Dashboard() {
  const [showDebug, setShowDebug] = useState(false);
  
  // Get context from Dynamic for wallet information
  const { primaryWallet } = useDynamicContext();

  // Determine wallet status
  const isWalletConnected = !!primaryWallet;

  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <h1 className="text-4xl font-bold mb-4">X402 + Nevermined Dashboard</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Test the integration between X402 payments and Nevermined credit system for AI agent interactions.
      </p>
      
      {/* Setup instructions */}
      <div className="w-full max-w-4xl mb-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-medium text-lg text-blue-800 dark:text-blue-300 mb-2">Setup Required</h3>
        <p className="text-blue-700 dark:text-blue-300 mb-2">
          Before using this demo, you need to:
        </p>
        <ol className="list-decimal pl-5 text-blue-700 dark:text-blue-300 mb-4 space-y-2">
          <li>
            Create your own Nevermined Payment Plan and AI agent at{" "}
            <Link href="https://base.nevermined.app" target="_blank" className="underline font-medium">
              https://base.nevermined.app
            </Link>
          </li>
          <li>
            Add your Nevermined API keys and agent DIDs to the <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">.env.local</code> file of this demo repository
          </li>
        </ol>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Without this configuration, the Nevermined credit functionality will not work properly.
        </p>
      </div>

      {/* Nevermined status section */}
      {isWalletConnected && (
        <div className="w-full max-w-4xl mb-8">
          <NeverminedStatus />
        </div>
      )}

      {/* Main components displayed in a responsive flex layout */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 mb-8">
        {/* x402 payment test */}
        <div className="flex-1">
          <X402DirectTest />
        </div>
        
        {/* Nevermined credit purchase */}
        <div className="flex-1">
          <NeverminedCreditPurchase />
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-muted-foreground max-w-md">
        <p>
          <strong>Note:</strong> This implementation uses real testnet transactions on Base Sepolia with your connected wallet. Make sure you have USDC on Base Sepolia to test payments.
        </p>
        
        <div className="border-t pt-3 mt-4">
          <button 
            onClick={() => setShowDebug(!showDebug)} 
            className="text-xs text-muted-foreground hover:underline"
          >
            {showDebug ? "Hide" : "Show"} Debug Info
          </button>
          <X402Debug show={showDebug} />
        </div>
      </div>
    </div>
  );
} 