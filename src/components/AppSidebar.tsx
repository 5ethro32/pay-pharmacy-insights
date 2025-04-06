
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
  SidebarSeparator,
  SidebarMenuAction,
  SidebarGroupAction,
  useSidebar
} from "@/components/ui/sidebar";
import { Calendar, ChevronRight, ChevronLeft, Database, FileSpreadsheet, LayoutDashboard, Users, User as UserIcon, Lock, ChevronUp, Settings } from "lucide-react";
import { Button } from './ui/button';

interface AppSidebarProps {
  activePage?: string;
}

const AppSidebar = ({ activePage = "dashboard" }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, toggleSidebar, state, setOpenMobile } = useSidebar();
  
  // Always close sidebar on mobile when navigating to a new page
  useEffect(() => {
    if (isMobile && state === 'expanded') {
      // Close sidebar immediately when location changes
      toggleSidebar();
    }
  }, [location.pathname, location.search, isMobile, toggleSidebar, state]);
  
  // Initialize the sidebar state on mount
  useEffect(() => {
    // Check for keepSidebarClosed flag on mount and reset it
    const shouldKeepClosed = sessionStorage.getItem('keepSidebarClosed') === 'true';
    if (shouldKeepClosed) {
      if (isMobile) {
        // Force close the mobile sidebar
        setOpenMobile(false);
      }
      // Clean up the flag
      sessionStorage.removeItem('keepSidebarClosed');
    }
  }, [setOpenMobile, isMobile]);
  
  const handleDashboardClick = (event: React.MouseEvent) => {
    // Prevent default link behavior
    event.preventDefault();
    
    // Set a flag in sessionStorage to indicate we're navigating programmatically
    sessionStorage.setItem('keepSidebarClosed', 'true');
    
    // Force a complete reload of the dashboard page
    window.location.href = '/dashboard';
    
    // Explicitly close sidebar when navigating to dashboard
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  const handleClick = (path: string) => {
    // Special handling for dashboard navigation
    if (path === '/dashboard') {
      sessionStorage.setItem('keepSidebarClosed', 'true');
      // Use the navigate API for consistency with other navigation
      navigate('/dashboard', { replace: true });
      
      // If on mobile, close the sidebar
      if (isMobile) {
        setOpenMobile(false);
      }
      return;
    }
    
    // Normal navigation for other pages
    navigate(path);
  };
  
  const handlePremiumFeature = (feature: string) => {
    alert(`This is a premium feature! Upgrade to access ${feature}.`);
  };

  const isCollapsed = state === 'collapsed';
  
  // Determine active page based on location
  const getActivePage = () => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    if (path.includes('/comparison/month')) {
      return 'month-comparison';
    }
    
    if (path === '/dashboard') {
      if (tab === 'upload') {
        return 'upload';
      }
      if (tab === 'documents') {
        return 'documents';
      }
      return 'dashboard';
    }
    
    return activePage;
  };
  
  const currentActivePage = getActivePage();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center px-2 py-3 justify-between">
          <div className="flex items-center">
            {/* Replace the BarChart3 icon with a chevron that changes direction */}
            <button
              onClick={toggleSidebar}
              className="text-red-800 hover:text-red-600 flex items-center justify-center h-6 w-6"
              aria-label={isCollapsed ? "Expand sidebar menu" : "Collapse sidebar menu"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 transition-transform duration-200" />
              ) : (
                <ChevronLeft className="h-5 w-5 transition-transform duration-200" />
              )}
            </button>
            {!isCollapsed && <span className="font-bold text-lg ml-2">ePSchedule</span>}
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
                  tooltip="Dashboard"
                  data-active={currentActivePage === "dashboard"}
                  asChild
                >
                  <a href="/dashboard" onClick={handleDashboardClick}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Documents"
                  data-active={currentActivePage === "documents"}
                  onClick={() => handleClick('/dashboard?tab=documents')}
                >
                  <Database />
                  <span>Documents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Upload"
                  data-active={currentActivePage === "upload"}
                  onClick={() => handleClick('/dashboard?tab=upload')}
                >
                  <FileSpreadsheet />
                  <span>Upload</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Comparisons</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Month Comparison"
                  data-active={currentActivePage === "month-comparison"}
                  onClick={() => handleClick('/comparison/month')}
                >
                  <Calendar />
                  <span>Month Comparison</span>
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
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Settings"
                  onClick={() => alert("Settings not implemented yet")}
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {!isCollapsed && (
        <SidebarFooter>
          <Button 
            variant="default" 
            className="w-full bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
          >
            <ChevronUp className="mr-2 h-4 w-4" />
            Upgrade to Premium
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default AppSidebar;
