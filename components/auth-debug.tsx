"use client";

import { useEffect, useState } from "react";
import { useDynamicContext, useIsLoggedIn, getAuthToken } from "@dynamic-labs/sdk-react-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthDebug() {
  const { 
    user, 
    primaryWallet,
    setShowAuthFlow,
    handleLogOut
  } = useDynamicContext();
  
  const isLoggedIn = useIsLoggedIn();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  
  // Get auth token and check for state inconsistencies
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      setAuthToken(token || null);
    }
  }, [isLoggedIn]);

  // Check for auth state issues
  const getStatusIndicator = () => {
    if (!isLoggedIn) return { status: "disconnected", message: "Not logged in" };
    if (!primaryWallet) return { status: "warning", message: "No wallet connected" };
    if (!authToken) return { status: "warning", message: "Missing auth token" };
    return { status: "connected", message: "Connected" };
  };

  const status = getStatusIndicator();
  const statusColors = {
    connected: "bg-green-500",
    warning: "bg-yellow-500",
    disconnected: "bg-red-500",
  };

  const handleReset = () => {
    handleLogOut();
    localStorage.removeItem("dynamic-auth-token");
    window.location.reload();
  };

  return (
    <Card className="mt-4 bg-slate-50 dark:bg-slate-900 border">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Auth Status</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[status.status as keyof typeof statusColors]}`}></div>
            <span className="text-xs font-medium">{status.message}</span>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0 pb-3">
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-1">
              <div className="font-medium">Is Logged In:</div>
              <div>{String(isLoggedIn)}</div>
              
              <div className="font-medium">Has Auth Token:</div>
              <div>{String(!!authToken)}</div>
              
              <div className="font-medium">Has User Object:</div>
              <div>{String(!!user)}</div>
              
              <div className="font-medium">Has Wallet:</div>
              <div>{String(!!primaryWallet)}</div>
              
              {primaryWallet && (
                <>
                  <div className="font-medium">Address:</div>
                  <div className="truncate text-xs">{primaryWallet.address}</div>
                  
                  <div className="font-medium">Network:</div>
                  <div>{primaryWallet.chain || "Unknown"}</div>
                </>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAuthFlow(true)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Login
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reset Auth
              </button>
            </div>
          </div>
        </CardContent>
      )}
      
      <div 
        className="text-center border-t py-1 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide Details" : "Show Details"}
      </div>
    </Card>
  );
} 