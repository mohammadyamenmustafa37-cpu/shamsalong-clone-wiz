import { Scissors, LogIn, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="py-8 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 bg-salon-purple rounded-full">
            <Scissors className="w-8 h-8 text-salon-purple-dark" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-salon-purple">Sham Salong</h1>
            <p className="text-muted-foreground">Oxelösunds bästa frisörsalong</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                asChild
                variant="outline"
                className="border-salon-green text-salon-green hover:bg-salon-green hover:text-salon-purple-dark"
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
              className="border-salon-green text-salon-green hover:bg-salon-green hover:text-salon-purple-dark"
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