
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  useSidebar,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { BarChart3, Calendar, Database, FileSpreadsheet, LayoutDashboard, Users, User as UserIcon, Lock, ChevronUp, Menu, X } from "lucide-react";
import { Button } from './ui/button';

interface AppSidebarProps {
  activePage?: string;
}

const AppSidebar = ({ activePage = "dashboard" }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, toggleSidebar, state } = useSidebar();
  
  // Close sidebar on mobile when navigating to a new page
  useEffect(() => {
    if (isMobile && state === 'expanded') {
      // Close sidebar on mobile when location changes
      const closeTimeout = setTimeout(() => {
        toggleSidebar();
      }, 300);
      
      return () => clearTimeout(closeTimeout);
    }
  }, [location.pathname, isMobile, toggleSidebar, state]);
  
  const handleClick = (path: string) => {
    navigate(path);
  };
  
  const handlePremiumFeature = (feature: string) => {
    alert(`This is a premium feature! Upgrade to access ${feature}.`);
  };

  const isCollapsed = state === 'collapsed';

  return (
    <>
      {/* Mobile Sidebar Toggle Button - Repositioned */}
      <div className="fixed z-20 top-4 left-4 md:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar} 
          className="rounded-full bg-white shadow-md hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center px-2 py-3 justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-red-800 mr-2" />
              {!isCollapsed && <span className="font-bold text-lg">ePSchedule</span>}
            </div>
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Dashboard"
                    data-active={activePage === "dashboard"}
                  >
                    <Link to="/dashboard">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Documents"
                    data-active={activePage === "documents"}
                  >
                    <Link to="/dashboard?tab=documents">
                      <Database />
                      <span>Documents</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    tooltip="Upload"
                    data-active={activePage === "upload"}
                  >
                    <Link to="/dashboard?tab=upload">
                      <FileSpreadsheet />
                      <span>Upload</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>Comparisons</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    tooltip="Month Comparison"
                    data-active={activePage === "month-comparison"}
                  >
                    <Link to="/comparison/month">
                      <Calendar />
                      <span>Month Comparison</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Group Comparison"
                    className="opacity-50 cursor-not-allowed"
                    onClick={() => handlePremiumFeature("Group Comparison")}
                  >
                    <Users />
                    <span className="flex items-center gap-2">
                      Group Comparison
                      <Lock className="h-3 w-3" />
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Peer Comparison"
                    className="opacity-50 cursor-not-allowed"
                    onClick={() => handlePremiumFeature("Peer Comparison")}
                  >
                    <UserIcon />
                    <span className="flex items-center gap-2">
                      Peer Comparison
                      <Lock className="h-3 w-3" />
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button 
            variant="default" 
            className="w-full bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
          >
            <ChevronUp className="mr-2 h-4 w-4" />
            {!isCollapsed && "Upgrade to Premium"}
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
