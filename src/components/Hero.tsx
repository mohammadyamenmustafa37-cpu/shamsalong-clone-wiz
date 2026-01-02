import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-barber.jpg";

const Hero = () => {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 leading-tight">
          Expertis i varje klipp
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
          Sen vi etablerats 2017, så har vi på <span className="text-primary">Shamsalong</span> fixat 
          de bästa frisyrerna i Oxelösund med precision och noggrannhet, och vårt nöje är att du som 
          kund har en bra upplevelse och stil. Du hittar oss på <span className="text-primary">Esplanaden 1B, Oxelösund</span>. Välkommen!
        </p>
        <Button 
          onClick={scrollToBooking}
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-md"
        >
          Boka nu
        </Button>
      </div>
    </section>
  );
};

export default Hero;
