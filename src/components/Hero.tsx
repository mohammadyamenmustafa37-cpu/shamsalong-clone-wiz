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
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 hero-overlay" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto animate-fade-up">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 leading-tight">
          Expertis i varje klipp
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Vi hör på <span className="text-primary font-semibold">Shamsalong</span> erbjuder de bästa frisyrerna 
          du kommer någonsin att få. Inga kompromisser får ske och du som kund ska ha det bästa. 
          Vår salong ligger på <span className="text-primary">Esplanaden 1B</span> Oxelösund.
        </p>
        <Button 
          onClick={scrollToBooking}
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-6 rounded-md transition-all duration-300 hover:scale-105"
        >
          Boka nu
        </Button>
      </div>
    </section>
  );
};

export default Hero;
