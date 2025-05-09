import { NextRequest, NextResponse } from "next/server";
import { 
  getBaseUrl, 
  getPaymentRecipientAddress, 
  getUsdcContractAddress, 
  isDevelopmentMode 
} from "@/lib/server/wallet";

// Get environment configuration
const BASE_URL = getBaseUrl();
const SELLER_ADDRESS = getPaymentRecipientAddress();
const BASE_SEPOLIA_USDC = getUsdcContractAddress();
const DEV_MODE = isDevelopmentMode();

// Credit conversion rate - adjust as needed
// This defines how many credits are allocated per USDC unit
// Example: 10 credits per USDC
const CREDITS_PER_USDC = 10;

// Check if a valid payment header is present
function hasValidPayment(request: NextRequest): boolean {
  // In development mode, we can bypass payment validation if a special header is set
  if (DEV_MODE && request.headers.get("X-DEV-BYPASS-PAYMENT") === "true") {
    return true;
  }
  
  const paymentHeader = request.headers.get("X-PAYMENT");
  if (!paymentHeader) {
    return false;
  }

  try {
    // Parse payment data from header
    const paymentData = JSON.parse(Buffer.from(paymentHeader, "base64").toString());
    
    // Verify the payment data
    // In a production environment, you would validate this against blockchain data
    // For this example, we'll just check if required fields are present
    const requiredFields = ['from', 'to', 'asset', 'amount', 'tx', 'network'];
    const hasAllFields = requiredFields.every(field => paymentData[field] !== undefined);
    
    if (!hasAllFields) {
      console.error("Invalid payment data: missing required fields");
      return false;
    }
    
    // Verify payment is sent to the correct recipient
    if (paymentData.to.toLowerCase() !== SELLER_ADDRESS.toLowerCase()) {
      console.error(`Payment sent to wrong recipient: ${paymentData.to} vs ${SELLER_ADDRESS}`);
      return false;
    }
    
    // Verify payment is made in the correct token
    if (paymentData.asset.toLowerCase() !== BASE_SEPOLIA_USDC.toLowerCase()) {
      console.error(`Payment made in wrong token: ${paymentData.asset} vs ${BASE_SEPOLIA_USDC}`);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Failed to parse payment header:", err);
    return false;
  }
}

// Calculate credits from payment amount
function calculateCredits(paymentHeader: string): number {
  try {
    const paymentData = JSON.parse(Buffer.from(paymentHeader, "base64").toString());
    
    // Payment amount is in USDC's smallest unit (6 decimals)
    // Convert to USDC and then calculate credits
    const usdcAmount = Number(paymentData.amount) / 1_000_000; // 6 decimals for USDC
    const credits = Math.floor(usdcAmount * CREDITS_PER_USDC);
    
    return credits;
  } catch (err) {
    console.error("Failed to calculate credits:", err);
    return 0;
  }
}

// Mock function to add credits to a user account
// In a real implementation, this would interact with the Nevermined SDK
async function allocateCredits(walletAddress: string, credits: number): Promise<boolean> {
  // Here you would call Nevermined SDK to allocate credits
  // This is a placeholder for demonstration
  console.log(`Allocating ${credits} credits to ${walletAddress}`);
  
  // In a real implementation, this would be persisted in a database or blockchain
  return true;
}

export async function GET(request: NextRequest) {
  // In development, allow testing with a bypass URL parameter
  const searchParams = request.nextUrl.searchParams;
  const bypassPayment = DEV_MODE && (searchParams.get("bypass") === "true");
  const amount = searchParams.get("amount") || "500000"; // Default 0.5 USDC
  
  // Check if we have a valid payment header or are bypassing payment in dev mode
  if (hasValidPayment(request) || bypassPayment) {
    // If we have a valid payment, extract the sender's address and credit amount
    const paymentHeader = request.headers.get("X-PAYMENT");
    let walletAddress = "0x0000000000000000000000000000000000000000";
    let credits = 0;
    
    if (paymentHeader) {
      try {
        const paymentData = JSON.parse(Buffer.from(paymentHeader, "base64").toString());
        walletAddress = paymentData.from;
        credits = calculateCredits(paymentHeader);
      } catch (err) {
        console.error("Failed to process payment header:", err);
        return NextResponse.json(
          { success: false, error: "Failed to process payment" },
          { status: 400 }
        );
      }
    } else if (bypassPayment) {
      // For testing in dev mode with bypass
      walletAddress = searchParams.get("address") || "0x0000000000000000000000000000000000000000";
      credits = Number(amount) / 1_000_000 * CREDITS_PER_USDC;
    }
    
    // Allocate credits to the user's account
    const success = await allocateCredits(walletAddress, credits);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to allocate credits" },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          walletAddress,
          credits,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          // Create a correctly formatted payment response header
          "X-PAYMENT-RESPONSE": Buffer.from(
            JSON.stringify({
              success: true,
              payment: {
                tx: bypassPayment ? "0x" + Date.now().toString(16).padStart(64, '0') : // Mock transaction hash if bypassing
                     JSON.parse(Buffer.from(paymentHeader || "", "base64").toString()).tx,
                facilitator: BASE_URL,
                payer: walletAddress
              }
            })
          ).toString("base64"),
        },
      }
    );
  }

  // If no valid payment, return 402 Payment Required with payment details
  return NextResponse.json(
    {
      // Version of the x402 payment protocol - must be 1
      x402Version: 1,
      
      // List of payment requirements the resource server accepts
      accepts: [
        {
          // Must use "exact" for scheme
          scheme: "exact",
          
          // Network ID - must match exactly what x402-fetch expects for Base Sepolia
          network: "base-sepolia",
          
          // Amount required (in atomic units of the asset as a string)
          maxAmountRequired: amount, 
          
          // Resource information
          resource: `${BASE_URL}/api/nevermined-credits`,
          
          // Description of the resource
          description: "Purchase Nevermined credits",
          
          // MIME type of the resource
          mimeType: "application/json",
          
          // Payment recipient
          payTo: SELLER_ADDRESS,
          
          // Timeout in seconds
          maxTimeoutSeconds: 60,
          
          // Asset (token) to pay with
          asset: BASE_SEPOLIA_USDC,
          
          // Extra information
          extra: {
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6
          }
        },
      ],
    },
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
} 