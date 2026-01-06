import { Link } from "react-router-dom";
import { Facebook, MapPin, Phone } from "lucide-react";
import logo from "@/assets/shamsalong-logo.png";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50 py-6 px-6 md:px-8 relative">
      {/* Logo - Top Right Corner */}
      <div className="absolute top-4 right-6 md:right-8">
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center overflow-hidden">
          <img
            src={logo}
            alt="Shamsalong logo"
            className="w-8 h-8 object-contain"
            loading="lazy"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pr-14 md:pr-16">
          {/* Social Media Icons - Left */}
          <div className="flex items-center gap-4">
            <a
              href="tel:0793488688"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Ring oss"
            >
              <Phone className="w-5 h-5" />
            </a>
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

          {/* Center Content */}
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
