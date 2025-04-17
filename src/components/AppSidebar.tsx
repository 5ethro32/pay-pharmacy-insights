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
import { Calendar, ChevronRight, ChevronLeft, Database, FileSpreadsheet, LayoutDashboard, Users, User as UserIcon, Lock, ChevronUp, Settings, Star } from "lucide-react";
import { Button } from './ui/button';

interface AppSidebarProps {
  activePage?: string;
  isPremium?: boolean;
}

const AppSidebar = ({ activePage = "dashboard", isPremium = true }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, toggleSidebar, state, setOpenMobile } = useSidebar();
  
  useEffect(() => {
    if (isMobile && state === 'expanded') {
      toggleSidebar();
    }
  }, [location.pathname, location.search, isMobile, toggleSidebar, state]);
  
  useEffect(() => {
    const shouldKeepClosed = sessionStorage.getItem('keepSidebarClosed') === 'true';
    if (shouldKeepClosed) {
      if (isMobile) {
        setOpenMobile(false);
      }
      sessionStorage.removeItem('keepSidebarClosed');
    }
  }, [setOpenMobile, isMobile]);
  
  const handleDashboardClick = (event: React.MouseEvent) => {
    event.preventDefault();
    sessionStorage.setItem('keepSidebarClosed', 'true');
    window.location.href = '/dashboard';
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  const handleClick = (path: string) => {
    if (path === '/dashboard') {
      sessionStorage.setItem('keepSidebarClosed', 'true');
      navigate('/dashboard', { replace: true });
      if (isMobile) {
        setOpenMobile(false);
      }
      return;
    }
    navigate(path);
  };
  
  const handlePremiumFeature = (feature: string) => {
    alert(`This is a premium feature! Upgrade to access ${feature}.`);
  };

  const handleUpgradeClick = () => {
    navigate('/premium');
  };

  const isCollapsed = state === 'collapsed';
  
  const getActivePage = () => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    if (path.includes('/comparison/month')) {
      return 'month-comparison';
    }
    
    if (path.includes('/comparison/peer')) {
      return 'peer-comparison';
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
                  tooltip="Peer Comparison"
                  data-active={currentActivePage === "peer-comparison"}
                  className={isPremium ? "" : "opacity-50 cursor-not-allowed"}
                  onClick={() => isPremium ? handleClick('/comparison/peer') : handlePremiumFeature("Peer Comparison")}
                >
                  <Users />
                  <span className="flex items-center gap-2">
                    Peer Comparison
                    {isPremium && <Star className="h-3 w-3 text-amber-500" fill="currentColor" />}
                    {!isPremium && <Lock className="h-3 w-3" />}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Group Comparison"
                  className="opacity-50 cursor-not-allowed"
                  onClick={() => handlePremiumFeature("Group Comparison")}
                >
                  <UserIcon />
                  <span className="flex items-center gap-2">
                    Group Comparison
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
          {!isPremium ? (
            <Button 
              variant="default" 
              className="w-full bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
              onClick={handleUpgradeClick}
            >
              <ChevronUp className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          ) : (
            <div className="flex items-center justify-center py-2 px-3 w-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-md text-white font-medium">
              <Star className="mr-2 h-4 w-4" fill="white" />
              Premium Active
            </div>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default AppSidebar;
