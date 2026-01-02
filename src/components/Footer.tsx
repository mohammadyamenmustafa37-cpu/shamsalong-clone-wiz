import { Link } from "react-router-dom";
import { Facebook, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50 py-6 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Social Media Icons - Bottom Left */}
          <div className="flex items-center gap-4">
            <a
              href="https://maps.app.goo.gl/ZBQjbjvQxJPFvr8y8?g_st=com.google.maps.preview.copy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Google Maps"
            >
              <MapPin className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/share/1BAV6yT26e/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>

          {/* Center/Right Content */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex gap-6 text-sm">
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
