import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Users, FileText, Image, Settings } from "lucide-react";

export function MobileBottomNav() {
  const router = useRouter();
  
  const routes = [
    { href: "/", label: "Home", icon: Home },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/studies", label: "Studies", icon: FileText },
    { href: "/viewer", label: "Viewer", icon: Image },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <nav className="flex justify-around items-center h-16">
        {routes.map((route) => {
          const Icon = route.icon;
          return (
            <Link 
              key={route.href}
              href={route.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive(route.href)
                  ? "text-primary"
                  : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
