import { NextRequest, NextResponse } from "next/server";
import { Payments } from "@nevermined-io/payments";

/**
 * Test API endpoint to verify Nevermined SDK initialization and connectivity
 */
export async function GET(request: NextRequest) {
  try {
    // Get environment variables for diagnostics
    const envVars = {
      NEXT_PUBLIC_NEVERMINED_ENVIRONMENT: process.env.NEXT_PUBLIC_NEVERMINED_ENVIRONMENT || '[not set]',
      NEXT_PUBLIC_NEVERMINED_RETURN_URL: process.env.NEXT_PUBLIC_NEVERMINED_RETURN_URL || '[not set]',
      NEXT_PUBLIC_NEVERMINED_APP_ID: process.env.NEXT_PUBLIC_NEVERMINED_APP_ID || '[not set]',
      NEXT_PUBLIC_NVM_AGENT_DID: process.env.NEXT_PUBLIC_NVM_AGENT_DID || '[not set]',
      NEXT_PUBLIC_NVM_PAYMENT_PLAN_DID: process.env.NEXT_PUBLIC_NVM_PAYMENT_PLAN_DID || '[not set]',
      NVM_API_KEY: process.env.NVM_API_KEY ? '[set but hidden]' : '[not set]',
      NVM_GET_ENDPOINT: process.env.NVM_GET_ENDPOINT || '[not set]',
      NVM_POST_ENDPOINT: process.env.NVM_POST_ENDPOINT || '[not set]',
    };

    console.log("Testing Nevermined SDK initialization...");
    console.log(`Environment: ${process.env.NEXT_PUBLIC_NEVERMINED_ENVIRONMENT}`);

    // Initialize the Payments SDK using the browser instance approach
    // Note: This is server-side code, but we're using the browser instance pattern
    // to test the initialization flow. In production, you'd use a different approach.
    const paymentsInstance = Payments.getBrowserInstance({
      returnUrl: process.env.NEXT_PUBLIC_NEVERMINED_RETURN_URL,
      environment: process.env.NEXT_PUBLIC_NEVERMINED_ENVIRONMENT as any,
      appId: process.env.NEXT_PUBLIC_NEVERMINED_APP_ID || 'x402-nvm-integration',
      version: 'v1.0.0',
    });

    // Try to initialize the SDK
    let sdkError = null;
    try {
      await paymentsInstance.init();
    } catch (err: unknown) {
      sdkError = err instanceof Error ? err.message : String(err);
    }

    if (sdkError) {
      return NextResponse.json(
        {
          success: false,
          error: `SDK initialization failed: ${sdkError}`,
          diagnostics: { envVars }
        },
        { status: 500 }
      );
    }

    // Return success response with SDK initialization info
    return NextResponse.json(
      {
        success: true,
        message: "Successfully initialized Nevermined SDK",
        sdk: {
          isInitialized: true,
          isLoggedIn: paymentsInstance.isLoggedIn || false,
          sdkVersion: paymentsInstance.version,
        },
        diagnostics: { envVars }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error testing Nevermined SDK:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Error testing Nevermined SDK: ${error instanceof Error ? error.message : String(error)}`,
        diagnostics: {
          envVars: {
            NEXT_PUBLIC_NEVERMINED_ENVIRONMENT: process.env.NEXT_PUBLIC_NEVERMINED_ENVIRONMENT || '[not set]',
            NEXT_PUBLIC_NEVERMINED_RETURN_URL: process.env.NEXT_PUBLIC_NEVERMINED_RETURN_URL || '[not set]',
            NEXT_PUBLIC_NEVERMINED_APP_ID: process.env.NEXT_PUBLIC_NEVERMINED_APP_ID || '[not set]',
            NVM_API_KEY: process.env.NVM_API_KEY ? '[set but hidden]' : '[not set]',
          }
        }
      },
      { status: 500 }
    );
  }
} 