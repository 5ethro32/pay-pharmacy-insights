
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  SidebarFooter
} from "@/components/ui/sidebar";
import { BarChart3, Calendar, Calendar as CalendarIcon, Database, FileSpreadsheet, LayoutDashboard, Users, User as UserIcon, Lock, ChevronUp } from "lucide-react";
import { Button } from './ui/button';

interface AppSidebarProps {
  activePage?: string;
}

const AppSidebar = ({ activePage = "dashboard" }: AppSidebarProps) => {
  const navigate = useNavigate();
  
  const handleClick = (path: string) => {
    navigate(path);
  };
  
  const handlePremiumFeature = (feature: string) => {
    alert(`This is a premium feature! Upgrade to access ${feature}.`);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-2 py-3">
          <BarChart3 className="h-6 w-6 text-red-800 mr-2" />
          <span className="font-bold text-lg">ePSchedule</span>
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
                  onClick={() => handleClick('/dashboard?tab=documents')}
                  data-active={activePage === "documents"}
                >
                  <a href="#">
                    <Database />
                    <span>Documents</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Upload"
                  onClick={() => handleClick('/dashboard?tab=upload')}
                  data-active={activePage === "upload"}
                >
                  <a href="#">
                    <FileSpreadsheet />
                    <span>Upload</span>
                  </a>
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
                    <CalendarIcon />
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
          Upgrade to Premium
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
