import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Services from "@/components/Services";
import Booking from "@/components/Booking";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <Services />
      <Booking />
      <Contact />
      
      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-display text-xl text-primary mb-2">Shamsalong</p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Shamsalong. Alla rättigheter förbehållna.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
