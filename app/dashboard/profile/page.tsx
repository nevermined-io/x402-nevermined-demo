"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { AuthDebug } from "@/components/auth-debug";

export default function Profile() {
  const { primaryWallet, user } = useDynamicContext();
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Wallet Address</span>
                <span className="font-mono text-sm break-all">{primaryWallet?.address}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Chain</span>
                <span>{primaryWallet?.chain}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Connector</span>
                <span>{primaryWallet?.connector?.name || 'Unknown'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Connection Status</span>
                <span>{primaryWallet?.isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="font-mono text-sm break-all">{user.userId}</span>
                </div>
                {user.email && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span>{user.email}</span>
                  </div>
                )}
                {user.username && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Username</span>
                    <span>{user.username}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Connected at</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">User information not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug button */}
      <div className="flex justify-center">
        <button 
          onClick={() => setShowDebug(prev => !prev)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {showDebug ? "Hide Debug Info" : "Show Debug Info"}
        </button>
      </div>

      {/* Auth debug component */}
      {showDebug && <AuthDebug />}
    </div>
  );
} 