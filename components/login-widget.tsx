"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DynamicWidget, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

interface LoginWidgetProps {
  variant?: "modal" | "dropdown";
  size?: "default" | "large";
}

export function LoginWidget({ variant = "dropdown", size = "default" }: LoginWidgetProps) {
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const pathname = usePathname();
  
  // Redirect authenticated users away from public pages
  useEffect(() => {
    const isPublicPage = pathname === "/" || pathname === "/login";
    if (isLoggedIn && isPublicPage) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router, pathname]);

  // Don't render if we're on a public page and logged in
  if (isLoggedIn && (pathname === "/" || pathname === "/login")) {
    return null;
  }

  // Don't render if we're already on the dashboard
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  // Set up button styles based on size
  const buttonText = size === "large" ? "Get Started" : "Login";
  const buttonClasses = size === "large" 
    ? "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 text-base"
    : "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2";

  return (
    <DynamicWidget
      variant={variant}
      innerButtonComponent={
        <div className={buttonClasses}>
          {buttonText}
        </div>
      }
    />
  );
} 