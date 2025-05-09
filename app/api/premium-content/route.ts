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

// Check if a valid payment header is present
function hasValidPayment(request: NextRequest): boolean {
  // In development mode, we can bypass payment validation if a special header is set
  if (DEV_MODE && request.headers.get("X-DEV-BYPASS-PAYMENT") === "true") {
    return true;
  }
  
  const paymentHeader = request.headers.get("X-PAYMENT");
  return !!paymentHeader; // In a real implementation, we would validate the payment payload
}

export async function GET(request: NextRequest) {
  // In development, allow testing with a bypass URL parameter
  const searchParams = request.nextUrl.searchParams;
  const bypassPayment = DEV_MODE && (searchParams.get("bypass") === "true");
  
  // Check if we have a valid payment header or are bypassing payment in dev mode
  if (hasValidPayment(request) || bypassPayment) {
    // If we have a valid payment, return the protected content
    return NextResponse.json(
      {
        title: "Premium Content",
        content: "This is premium content that was accessed using an x402 payment. Congratulations!",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          // Create a correctly formatted payment response header according to x402 spec
          "X-PAYMENT-RESPONSE": Buffer.from(
            JSON.stringify({
              success: true,
              payment: {
                tx: "0x" + Date.now().toString(16).padStart(64, '0'), // Mock transaction hash
                facilitator: BASE_URL, // Our server is acting as its own facilitator
                payer: request.headers.get("X-PAYMENT") 
                  ? JSON.parse(Buffer.from(request.headers.get("X-PAYMENT") || "", "base64").toString()).from
                  : "0x0000000000000000000000000000000000000000"
              }
            })
          ).toString("base64"),
        },
      }
    );
  }

  // If no valid payment, return 402 Payment Required with payment details
  // Following the exact x402 protocol schema
  return NextResponse.json(
    {
      // Version of the x402 payment protocol - must be 1
      x402Version: 1,
      
      // List of payment requirements the resource server accepts - must be an array
      accepts: [
        {
          // Must use "exact" for scheme (this is the only one supported in the current version)
          scheme: "exact",
          
          // Network ID - must match exactly what x402-fetch expects for Base Sepolia
          network: "base-sepolia",
          
          // Amount required (in atomic units of the asset as a string)
          // 0.5 USDC with 6 decimals = 500000
          maxAmountRequired: "500000", 
          
          // Resource information - must be a full absolute URL
          resource: `${BASE_URL}/api/premium-content`,
          
          // Description of the resource
          description: "Access to premium content",
          
          // MIME type of the resource
          mimeType: "application/json",
          
          // Payment recipient
          payTo: SELLER_ADDRESS,
          
          // Timeout in seconds
          maxTimeoutSeconds: 60,
          
          // Asset (token) to pay with - must be the correct USDC address on Base Sepolia
          asset: BASE_SEPOLIA_USDC,
          
          // Extra information (can be null)
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