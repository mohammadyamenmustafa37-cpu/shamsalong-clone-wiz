import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50 py-6 px-6 md:px-8">
      <div className="max-w-6xl mx-auto text-center space-y-3">
        <div className="flex justify-center gap-6 text-sm">
          <Link 
            to="/privacy-policy" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Integritetspolicy
          </Link>
          <Link 
            to="/terms-of-service" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Användarvillkor
          </Link>
        </div>
        <p className="text-muted-foreground text-sm">
          © 2025 Shamsalong. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
