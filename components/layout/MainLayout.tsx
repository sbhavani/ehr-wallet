
import { useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileNav } from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TouchSwipe } from "@/components/ui/touch-swipe";
import SyncManager from "@/components/SyncManager";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();
  const isTablet = useMediaQuery({ query: "(min-width: 768px)" });
  const router = useRouter();
  
  // Set sidebar default state based on screen size - always open on desktop
  useEffect(() => {
    // Only close on mobile, keep open on desktop
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Store sidebar state in localStorage to persist across navigation
  useEffect(() => {
    // Only store for desktop view
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen, isMobile]);
  
  // Restore sidebar state from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && !isMobile) {
      const storedState = localStorage.getItem('sidebarOpen');
      if (storedState !== null) {
        // Parse stored state, but default to true (open) if not found
        setSidebarOpen(storedState ? JSON.parse(storedState) : true);
      } else {
        // If no stored state, default to open
        setSidebarOpen(true);
      }
    }
  }, [isMobile]);
  
  // Prevent sidebar from collapsing during page transitions
  useEffect(() => {
    const handleRouteChangeStart = () => {
      // Don't close sidebar on route change
      // We're intentionally not modifying the state here
    };
    
    router.events.on('routeChangeStart', handleRouteChangeStart);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [router]);
  
  // On mobile, sidebar is closed by default
  const isOpen = isMobile ? false : sidebarOpen;
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };
  
  // Swipe right to open menu functionality removed as requested
  
  const handleSwipeLeft = () => {
    if (isMobile && mobileNavOpen) {
      setMobileNavOpen(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        toggleSidebar={toggleSidebar} 
        toggleMobileNav={toggleMobileNav}
        isMobileNavOpen={mobileNavOpen}
      />
      
      {/* Mobile Navigation Drawer - only rendered when open */}
      {isMobile && (
        <MobileNav 
          isOpen={mobileNavOpen} 
          onClose={() => setMobileNavOpen(false)} 
        />
      )}
      
      <TouchSwipe 
        onSwipeLeft={handleSwipeLeft}
        className="min-h-[calc(100vh-4rem)]"
      >
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] w-full">
          {/* Desktop Sidebar - hidden on mobile */}
          {!isMobile && (
            <Sidebar isOpen={isOpen} onClose={() => setSidebarOpen(false)} />
          )}
          
          <main 
            className={`
              flex-1 p-4 md:p-6 overflow-y-auto transition-all duration-300
              ${isMobile ? 'pb-20' : ''}
            `}
          >
            {children}
          </main>
        </div>
      </TouchSwipe>
      
      {/* Mobile Bottom Navigation - only visible on mobile */}
      {isMobile && <MobileBottomNav />}
      
      {/* Sync Manager for offline data synchronization */}
      <SyncManager />
    </div>
  );
};
