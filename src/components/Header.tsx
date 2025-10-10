import { LogIn, LogOut, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Link, useLocation } from "react-router-dom";
import shamSalongLogo from "@/assets/sham-salong-logo.jpeg";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <header className="py-4 md:py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src={shamSalongLogo} 
            alt="Sham Salong Logo" 
            className="w-16 h-16 md:w-20 md:h-20 object-contain flex-shrink-0"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-salon-gold">Sham Salong</h1>
            <p className="text-sm md:text-base text-salon-gold-muted">Oxelösunds bästa frisörsalong</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {user ? (
            <>
              {isAdminPage && (
                <Button
                  asChild
                  variant="outline"
                  className="border-salon-green text-salon-green hover:bg-salon-green hover:text-salon-purple-dark"
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
                  variant="outline"
                  className="border-salon-gold text-salon-gold hover:bg-salon-gold hover:text-salon-navy"
                >
                  <Link to="/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </Button>
              )}
              <Button
                onClick={signOut}
                variant="outline"
                className="border-salon-card text-muted-foreground hover:bg-salon-card"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logga ut</span>
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              className="border-salon-gold text-salon-gold hover:bg-salon-gold hover:text-salon-navy"
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