"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import DynamicProvider from "@/components/dynamic-provider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <DynamicProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </DynamicProvider>
  );
} 