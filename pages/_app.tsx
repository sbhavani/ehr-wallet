import "@/lib/crypto-polyfill";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { SessionWrapper } from "@/components/SessionWrapper";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import Head from "next/head";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { SplashScreen } from "@/components/pwa/SplashScreen";
import { UpdateNotification } from "@/components/pwa/UpdateNotification";
import { usePWA } from "@/hooks/use-pwa";
import { AppLayout } from "@/components/layout/AppLayout";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";

// Temporarily use regular import to debug dynamic import issue
import { MetaMaskProvider } from "@/components/web3/MetaMaskProvider";

// Create a client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [showSplash, setShowSplash] = useState(true);
  const { isStandalone } = usePWA();

  useEffect(() => {
    // Only show splash screen briefly
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GlobalRad" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
            <TooltipProvider>
            {/* Show splash screen only on initial load when in standalone mode */}
            {showSplash && isStandalone && <SplashScreen />}
            
            {/* Show offline indicator when needed */}
            <OfflineIndicator />
            
            {/* Show update notification when available */}
            <UpdateNotification />
            
            {/* Main content with SessionWrapper, AppLayout and MetaMaskProvider */}
            <SessionWrapper>
              <AppLayout>
                <MetaMaskProvider>
                  <Component {...pageProps} />
                </MetaMaskProvider>
              </AppLayout>
            </SessionWrapper>
            
            {/* Show install prompt when appropriate */}
            <InstallPrompt />
            
            {/* UI components */}
            <Toaster />
            <Sonner />
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
}
