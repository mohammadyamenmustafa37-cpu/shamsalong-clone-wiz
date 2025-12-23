import { LogIn, LogOut, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-4 md:py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-2xl md:text-3xl font-bold text-primary group-hover:text-primary/80 transition-colors">
            Shamsalong
          </span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <>
              {isAdminPage && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground/80 hover:text-foreground hover:bg-foreground/10"
                >
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Hem</span>
                  </Link>
                </Button>
              )}
              {!isAdminPage && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground/80 hover:text-foreground hover:bg-foreground/10"
                >
                  <Link to="/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </Button>
              )}
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground hover:bg-foreground/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logga ut</span>
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-foreground/20 text-foreground hover:bg-foreground/10 hover:border-foreground/40"
            >
              <Link to="/login">
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Admin Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
