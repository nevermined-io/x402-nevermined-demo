"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ModeToggle } from "@/components/mode-toggle";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const [notifications, setNotifications] = useState(true);
  const router = useRouter();
  
  // Format wallet address for display
  const shortAddress = primaryWallet?.address 
    ? `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`
    : 'Not connected';
  
  // Handle disconnect wallet
  const handleDisconnect = () => {
    handleLogOut();
    router.push('/');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Wallet Information</h3>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div>
                  <div className="text-sm font-medium">{shortAddress}</div>
                  <div className="text-xs text-muted-foreground">{primaryWallet?.chain || "Unknown chain"}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Application Preferences</h3>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div>
                  <div className="text-sm font-medium">Notifications</div>
                  <div className="text-xs text-muted-foreground">Receive notifications about activity</div>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div>
                  <div className="text-sm font-medium">Theme</div>
                  <div className="text-xs text-muted-foreground">Toggle between light and dark mode</div>
                </div>
                <ModeToggle />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="text-xs text-muted-foreground mb-2">
                Connected via {primaryWallet?.connector?.name || "unknown connector"}
              </div>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = 'https://docs.x402.org'}
              >
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 