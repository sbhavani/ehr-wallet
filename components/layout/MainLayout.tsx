
import { useState, ReactNode, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileNav } from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TouchSwipe } from "@/components/ui/touch-swipe";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();
  const isTablet = useMediaQuery({ query: "(min-width: 768px)" });
  
  // Set sidebar default state based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  // On mobile, sidebar is closed by default
  const isOpen = isMobile ? false : sidebarOpen;
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };
  
  const handleSwipeRight = () => {
    if (isMobile && !mobileNavOpen) {
      setMobileNavOpen(true);
    }
  };
  
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
      
      {/* Mobile Navigation Drawer */}
      {isMobile && mobileNavOpen && (
        <MobileNav onClose={() => setMobileNavOpen(false)} />
      )}
      
      <TouchSwipe 
        onSwipeRight={handleSwipeRight} 
        onSwipeLeft={handleSwipeLeft}
        className="min-h-[calc(100vh-4rem)]"
      >
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
          {/* Desktop Sidebar - hidden on mobile */}
          {!isMobile && (
            <Sidebar isOpen={isOpen} onClose={() => setSidebarOpen(false)} />
          )}
          
          <main 
            className={`
              flex-1 p-4 md:p-6 overflow-y-auto transition-all duration-300
              ${isMobile ? 'pb-20' : ''} 
              ${!isMobile && sidebarOpen ? 'md:ml-64' : ''}
            `}
          >
            {children}
          </main>
        </div>
      </TouchSwipe>
      
      {/* Mobile Bottom Navigation - only visible on mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};
