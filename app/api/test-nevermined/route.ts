import { NextRequest, NextResponse } from "next/server";

/**
 * Test API endpoint to verify Nevermined API key and connectivity
 */
export async function GET(request: NextRequest) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.NVM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "NVM_API_KEY is not defined in environment variables",
          diagnostics: {
            envVars: {
              NEXT_PUBLIC_NEVERMINED_ENVIRONMENT: process.env.NEXT_PUBLIC_NEVERMINED_ENVIRONMENT || '[not set]',
              NEXT_PUBLIC_NEVERMINED_RETURN_URL: process.env.NEXT_PUBLIC_NEVERMINED_RETURN_URL || '[not set]',
              NEXT_PUBLIC_NEVERMINED_APP_ID: process.env.NEXT_PUBLIC_NEVERMINED_APP_ID || '[not set]',
              NVM_API_KEY: apiKey ? '[set but hidden]' : '[not set]'
            }
          }
        },
        { status: 500 }
      );
    }
    
    // Get the Nevermined endpoint from environment variables
    // We should use the base proxy URL rather than the specific endpoint for API authentication
    const proxyUrl = process.env.NEXT_PUBLIC_NVM_PROXY_URL || process.env.NVM_PROXY_URL;
    
    if (!proxyUrl) {
      // Fallback to getting the base URL from the GET endpoint
      const endpoint = process.env.NVM_GET_ENDPOINT;
      if (!endpoint) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Neither NEXT_PUBLIC_NVM_PROXY_URL nor NVM_GET_ENDPOINT is defined in environment variables",
            diagnostics: {
              envVars: {
                NEXT_PUBLIC_NEVERMINED_ENVIRONMENT: process.env.NEXT_PUBLIC_NEVERMINED_ENVIRONMENT || '[not set]',
                NEXT_PUBLIC_NEVERMINED_RETURN_URL: process.env.NEXT_PUBLIC_NEVERMINED_RETURN_URL || '[not set]',
                NEXT_PUBLIC_NEVERMINED_APP_ID: process.env.NEXT_PUBLIC_NEVERMINED_APP_ID || '[not set]',
                NVM_API_KEY: apiKey ? '[set but hidden]' : '[not set]',
                NEXT_PUBLIC_NVM_PROXY_URL: '[not set]',
                NVM_GET_ENDPOINT: '[not set]'
              }
            }
          },
          { status: 500 }
        );
      }
    }
    
    // Map environment to proper ID (should preserve appBase, not map it to testing)
    const envSetting = process.env.NEXT_PUBLIC_NEVERMINED_ENVIRONMENT || 'testing';
    
    // If the environment is already in the correct format (starts with 'app'), use it directly
    const mappedEnvironment = envSetting.startsWith('app') ? envSetting : mapEnvironmentToId(envSetting);
    
    // Extract or determine the base URL for Nevermined API
    let baseEndpoint;
    
    if (proxyUrl) {
      // Use the directly provided proxy URL if available
      baseEndpoint = proxyUrl;
    } else if (process.env.NVM_GET_ENDPOINT) {
      // Otherwise extract from the GET endpoint
      const endpoint = process.env.NVM_GET_ENDPOINT;
      baseEndpoint = endpoint.replace(/\/api\/v1\/agents\/.*$/, "");
    } else {
      // Default based on environment
      baseEndpoint = envSetting === 'appBase'
        ? 'https://proxy.base.nevermined.app'
        : 'https://proxy.arbitrum.nevermined.app';
    }
    
    console.log(`Testing Nevermined API with key: ${apiKey.substring(0, 10)}...`);
    console.log(`Using environment: ${mappedEnvironment} (from ${envSetting})`);
    console.log(`Using endpoint: ${baseEndpoint}`);
    
    // Make a simple request to the Nevermined API to test the key
    // We'll use the /api/v1/auth/me endpoint which should return user info if the key is valid
    const response = await fetch(`${baseEndpoint}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to authenticate with Nevermined API: ${response.status} ${response.statusText}`,
          details: errorText,
          diagnostics: {
            request: {
              url: `${baseEndpoint}/api/v1/auth/me`,
              method: "GET",
              headers: {
                "Authorization": "Bearer [hidden]",
                "Content-Type": "application/json"
              }
            },
            envVars: {
              NEXT_PUBLIC_NEVERMINED_ENVIRONMENT: envSetting,
              MAPPED_ENVIRONMENT: mappedEnvironment,
              NEXT_PUBLIC_NEVERMINED_RETURN_URL: process.env.NEXT_PUBLIC_NEVERMINED_RETURN_URL || '[not set]',
              NEXT_PUBLIC_NEVERMINED_APP_ID: process.env.NEXT_PUBLIC_NEVERMINED_APP_ID || '[not set]',
              NVM_API_KEY: '[set but hidden]',
              NVM_GET_ENDPOINT: process.env.NVM_GET_ENDPOINT || '[not set]',
              NEXT_PUBLIC_NVM_PROXY_URL: process.env.NEXT_PUBLIC_NVM_PROXY_URL || '[not set]'
            }
          }
        },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Successfully authenticated with Nevermined API",
        user: data,
        diagnostics: {
          environment: {
            setting: envSetting,
            mapped: mappedEnvironment
          },
          endpoint: baseEndpoint
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error testing Nevermined API:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Error testing Nevermined API: ${error instanceof Error ? error.message : String(error)}`,
        diagnostics: {
          envVars: {
            NEXT_PUBLIC_NEVERMINED_ENVIRONMENT: process.env.NEXT_PUBLIC_NEVERMINED_ENVIRONMENT || '[not set]',
            NEXT_PUBLIC_NEVERMINED_RETURN_URL: process.env.NEXT_PUBLIC_NEVERMINED_RETURN_URL || '[not set]',
            NEXT_PUBLIC_NEVERMINED_APP_ID: process.env.NEXT_PUBLIC_NEVERMINED_APP_ID || '[not set]',
            NVM_API_KEY: process.env.NVM_API_KEY ? '[set but hidden]' : '[not set]',
            NVM_GET_ENDPOINT: process.env.NVM_GET_ENDPOINT || '[not set]',
            NEXT_PUBLIC_NVM_PROXY_URL: process.env.NEXT_PUBLIC_NVM_PROXY_URL || '[not set]'
          }
        }
      },
      { status: 500 }
    );
  }
}

// Helper to map environment names to Nevermined environment IDs
function mapEnvironmentToId(env: string): string {
  switch (env.toLowerCase()) {
    case 'arbitrum':
      return 'appArbitrum';
    case 'base':
      return 'appBase';
    case 'polygon':
    case 'matic':
      return 'appMatic';
    case 'gnosis':
      return 'appGnosis';
    case 'optimism':
      return 'appOptimism';
    case 'celo':
      return 'appCelo';
    case 'peaq':
      return 'appPeaq';
    case 'staging':
    case 'testing':
    case 'development':
      return env.toLowerCase();
    default:
      console.warn(`Unknown environment "${env}", defaulting to "testing"`);
      return 'testing';
  }
} 