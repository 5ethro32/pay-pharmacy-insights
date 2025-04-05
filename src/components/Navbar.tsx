
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to get initials from name
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-red-900 text-white p-1 rounded">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-6 w-6"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            </div>
            <span className="hidden font-bold text-xl md:inline-block">PharmacyPay</span>
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-red-800 transition-colors">Home</Link>
          <Link to="/demo" className="text-sm font-medium hover:text-red-800 transition-colors">Demo</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-red-800 transition-colors">Dashboard</Link>
              <Link to="/historic-data" className="text-sm font-medium hover:text-red-800 transition-colors">Your Data</Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-800 text-white">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/historic-data">Your Data</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="border-red-800 text-red-800 hover:bg-red-50">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild className="bg-red-800 hover:bg-red-900">
                <Link to="/login?tab=register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" className="h-9 w-9 p-0" onClick={toggleMobileMenu} aria-label="Toggle Menu">
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-red-50 hover:text-red-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/demo" 
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-red-50 hover:text-red-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo
            </Link>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-red-50 hover:text-red-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/historic-data" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-red-50 hover:text-red-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Your Data
                </Link>
                <button 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-800 hover:bg-red-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full border-red-800 text-red-800 hover:bg-red-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button 
                  asChild 
                  className="w-full bg-red-800 hover:bg-red-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/login?tab=register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
