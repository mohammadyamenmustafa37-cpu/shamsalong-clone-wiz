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
          Vi här på <span className="text-primary">Shamsalong</span> erbjuder de bästa frisyrerna 
          du kommer någonsin att få. Inga kompromisser får ske och du som kund ska ha det bästa. 
          Vår salong ligger på <span className="text-primary">Esplanaden 1B</span> Oxelösund.
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
