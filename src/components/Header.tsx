import { LogIn, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";
import shamSalongLogo from "@/assets/sham-salong-logo.jpeg";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="py-8 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={shamSalongLogo} 
            alt="Sham Salong Logo" 
            className="w-20 h-20 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-salon-gold">Sham Salong</h1>
            <p className="text-salon-gold-muted">Oxelösunds bästa frisörsalong</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                asChild
                variant="outline"
                className="border-salon-gold text-salon-gold hover:bg-salon-gold hover:text-salon-navy"
              >
                <Link to="/admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
              <Button
                onClick={signOut}
                variant="outline"
                className="border-salon-card text-muted-foreground hover:bg-salon-card"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logga ut
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
                Admin Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;