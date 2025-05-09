"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { LoginWidget } from "@/components/login-widget";

export default function Home() {
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-background text-foreground">
      <div className="container mx-auto">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">X402 + Nevermined</span>
          </div>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Technologies</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <Link href="https://x402.org" target="_blank" className="block">
                      <div className="p-4 rounded-md bg-accent hover:bg-accent/80">
                        <h3 className="font-medium leading-none mb-2">x402 Protocol</h3>
                        <p className="text-sm text-muted-foreground">
                          The open payment standard for HTTP 402 Payment Required implementation.
                        </p>
                      </div>
                    </Link>
                    <Link href="https://nevermined.io" target="_blank" className="block">
                      <div className="p-4 rounded-md bg-accent hover:bg-accent/80">
                        <h3 className="font-medium leading-none mb-2">Nevermined</h3>
                        <p className="text-sm text-muted-foreground">
                          Credit-based system for AI agent-to-agent interactions.
                        </p>
                      </div>
                    </Link>
                    <Link href="https://dynamic.xyz" target="_blank" className="block">
                      <div className="p-4 rounded-md bg-accent hover:bg-accent/80">
                        <h3 className="font-medium leading-none mb-2">Dynamic.xyz</h3>
                        <p className="text-sm text-muted-foreground">
                          Secure wallet authentication for Web3 applications.
                        </p>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                    <Link href="https://x402.gitbook.io/x402" target="_blank" className="block">
                      <div className="p-4 rounded-md bg-accent hover:bg-accent/80">
                        <h3 className="font-medium leading-none mb-2">x402 Documentation</h3>
                        <p className="text-sm text-muted-foreground">
                          Learn how to implement the x402 payment protocol.
                        </p>
                      </div>
                    </Link>
                    <Link href="https://docs.nevermined.app" target="_blank" className="block">
                      <div className="p-4 rounded-md bg-accent hover:bg-accent/80">
                        <h3 className="font-medium leading-none mb-2">Nevermined Documentation</h3>
                        <p className="text-sm text-muted-foreground">
                          Explore the Nevermined API and agent economy.
                        </p>
                      </div>
                    </Link>
                    <Link href="https://docs.dynamic.xyz/introduction/welcome" target="_blank" className="block">
                      <div className="p-4 rounded-md bg-accent hover:bg-accent/80">
                        <h3 className="font-medium leading-none mb-2">Dynamic.xyz Documentation</h3>
                        <p className="text-sm text-muted-foreground">
                          Implement wallet authentication and Web3 onboarding.
                        </p>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link href="https://github.com/nevermined-io/x402-nevermined-demo" target="_blank" className={navigationMenuTriggerStyle()}>
                  GitHub
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            <LoginWidget size="default" />
          </div>
        </header>
        
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center">
              <span className="font-bold text-2xl text-blue-500">Dynamic.xyz</span>
            </div>
            <span className="text-2xl">+</span>
            <div className="flex items-center">
              <span className="font-bold text-2xl text-purple-500">x402</span>
            </div>
            <span className="text-2xl">+</span>
            <div className="flex items-center">
              <span className="font-bold text-2xl text-green-500">Nevermined</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6">AI Agent Economy Integration</h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            Experience the future of AI agent interactions. Make a single payment to purchase credits, 
            then let your AI agents pay other agents without constant transaction signing or vulnerable session keys.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-4xl">
            <div className="flex flex-col items-center p-6 border rounded-lg bg-card">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-blue-500 font-bold">D</span>
              </div>
              <h3 className="font-bold mb-2">Wallet Authentication</h3>
              <p className="text-sm text-center text-muted-foreground">
                Secure user authentication with Dynamic.xyz's wallet connection.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 border rounded-lg bg-card">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-purple-500 font-bold">402</span>
              </div>
              <h3 className="font-bold mb-2">One-Time Payments</h3>
              <p className="text-sm text-center text-muted-foreground">
                Purchase credits with a single x402 blockchain transaction.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 border rounded-lg bg-card">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-green-500 font-bold">N</span>
              </div>
              <h3 className="font-bold mb-2">Agent Economy</h3>
              <p className="text-sm text-center text-muted-foreground">
                Enable AI agents to pay other agents with Nevermined credits.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <LoginWidget size="large" />
            <Link href="https://github.com/nevermined-io/x402-nevermined-demo" target="_blank">
              <Button size="lg" variant="outline">View Source</Button>
            </Link>
          </div>
          
          <div className="mt-12 text-sm text-muted-foreground">
            <p>This is a technology demonstration using Base Sepolia testnet.</p>
            <p className="mt-1">No real funds are required. <a href="https://faucet.circle.com/" target="_blank" className="underline">Get testnet USDC here.</a></p>
          </div>
        </div>
      </div>
    </main>
  );
}
