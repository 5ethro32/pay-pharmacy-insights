
import { Link, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { BarChart3, FileText, Home, Settings, Upload, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activePage?: string;
}

const AppSidebar = ({ activePage = "dashboard" }: AppSidebarProps) => {
  const location = useLocation();
  
  const navItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
      active: activePage === "dashboard" || location.pathname === "/dashboard"
    },
    {
      icon: Upload,
      label: "Upload",
      href: "/dashboard?tab=upload",
      active: location.search.includes("tab=upload")
    },
    {
      icon: FileText,
      label: "Documents",
      href: "/dashboard?tab=documents",
      active: location.search.includes("tab=documents")
    },
    {
      icon: BarChart3,
      label: "Comparisons",
      href: "/comparison/month",
      active: location.pathname.includes("/comparison")
    },
    {
      icon: Users,
      label: "Staff",
      href: "#",
      active: false,
      disabled: true
    },
    {
      icon: Settings,
      label: "Settings",
      href: "#",
      active: false,
      disabled: true
    }
  ];
  
  return (
    <Sidebar className="border-r border-gray-200 bg-white min-h-screen h-full fixed left-0">
      <SidebarHeader className="flex h-14 items-center px-4 border-b">
        <Link to="/dashboard" className="flex items-center">
          <span className="text-red-900 font-display font-bold text-xl">eP</span>
          <span className="text-red-800 font-display font-bold text-xl">Schedule</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-5">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.active 
                  ? "bg-red-50 text-red-900" 
                  : "text-gray-700 hover:bg-red-50/50 hover:text-red-900",
                item.disabled && "pointer-events-none opacity-50"
              )}
            >
              <item.icon className={cn("h-4 w-4", item.active ? "text-red-900" : "text-gray-500")} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
