
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Calendar,
  User,
  Users,
  Database,
  Settings,
  Info,
  FileSearch,
  FileCheck,
  Folder
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const isMobile = useIsMobile();
  
  const links = [
    { name: "Dashboard", path: "/", icon: <Database className="w-5 h-5" /> },
    { name: "Patient Registration", path: "/patients/register", icon: <User className="w-5 h-5" /> },
    { name: "Patient List", path: "/patients", icon: <Users className="w-5 h-5" /> },
    { name: "Scheduling", path: "/scheduling", icon: <Calendar className="w-5 h-5" /> },
    { name: "Study Worklist", path: "/studies", icon: <FileSearch className="w-5 h-5" /> },
    { name: "PACS Viewer", path: "/viewer", icon: <FileCheck className="w-5 h-5" /> },
    { name: "Reports", path: "/reports", icon: <Folder className="w-5 h-5" /> }
  ];
  
  const adminLinks = [
    { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" /> },
    { name: "Help & Support", path: "/support", icon: <Info className="w-5 h-5" /> }
  ];
  
  // Mobile overlay that closes when clicked outside
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={onClose}
          />
        )}
        <aside 
          className={cn(
            "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ease-in-out transform",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-medical-blue">RadGlobal RIS</h1>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
          
          <nav className="p-2">
            <div className="space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    cn("flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors", {
                      "bg-medical-blue text-white": isActive,
                      "text-gray-700 hover:bg-gray-100": !isActive
                    })
                  }
                  onClick={isMobile ? onClose : undefined}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.name}
                </NavLink>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administration
              </div>
              <div className="space-y-1">
                {adminLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      cn("flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors", {
                        "bg-medical-blue text-white": isActive,
                        "text-gray-700 hover:bg-gray-100": !isActive
                      })
                    }
                    onClick={isMobile ? onClose : undefined}
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
        </aside>
      </>
    );
  }
  
  // Desktop sidebar
  return (
    <aside 
      className={cn(
        "h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <nav className="p-2">
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                cn("flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors", {
                  "bg-medical-blue text-white": isActive,
                  "text-gray-700 hover:bg-gray-100": !isActive
                })
              }
            >
              <span className={cn("mr-3", !isOpen && "mr-0")}>
                {link.icon}
              </span>
              {isOpen && link.name}
            </NavLink>
          ))}
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          {isOpen && (
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administration
            </div>
          )}
          <div className="space-y-1">
            {adminLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn("flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors", {
                    "bg-medical-blue text-white": isActive,
                    "text-gray-700 hover:bg-gray-100": !isActive
                  })
                }
              >
                <span className={cn("mr-3", !isOpen && "mr-0")}>
                  {link.icon}
                </span>
                {isOpen && link.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};
