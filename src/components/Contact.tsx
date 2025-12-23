import { Card } from "@/components/ui/card";
import { Clock, MapPin, Phone } from "lucide-react";

const Contact = () => {
  return (
    <section className="px-4 md:px-6 py-12 md:py-20 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Besök Oss
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Centralt beläget i Oxelösund med bekväma öppettider
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <Card className="bg-card border-border p-6 md:p-8 text-center group hover:bg-card/80 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary/20 rounded-full mb-4 md:mb-6 group-hover:bg-primary/30 transition-colors">
              <Clock className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold mb-3 text-foreground">
              Öppettider
            </h3>
            <p className="text-muted-foreground mb-2">Måndag – Söndag</p>
            <p className="text-primary font-bold text-lg">10:00 – 19:00</p>
            <p className="text-sm text-muted-foreground mt-2">Alla dagar i veckan</p>
          </Card>
          
          <Card className="bg-card border-border p-6 md:p-8 text-center group hover:bg-card/80 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary/20 rounded-full mb-4 md:mb-6 group-hover:bg-primary/30 transition-colors">
              <MapPin className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold mb-3 text-foreground">
              Adress
            </h3>
            <p className="text-muted-foreground mb-2">Esplanaden 1B</p>
            <p className="text-primary font-bold text-lg">Oxelösund</p>
            <p className="text-sm text-muted-foreground mt-2">Centralt beläget</p>
          </Card>
          
          <Card className="bg-card border-border p-6 md:p-8 text-center group hover:bg-card/80 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary/20 rounded-full mb-4 md:mb-6 group-hover:bg-primary/30 transition-colors">
              <Phone className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl md:text-2xl font-bold mb-3 text-foreground">
              Kontakt
            </h3>
            <a 
              href="tel:0793488688" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-bold text-lg"
            >
              0793488688
            </a>
            <p className="text-sm text-muted-foreground mt-2">Ring för bokning</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
