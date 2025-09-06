import { Card } from "@/components/ui/card";
import { Clock, MapPin, Phone, Scissors } from "lucide-react";

const Contact = () => {
  return (
    <section className="px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Besök Oss</h2>
        <p className="text-xl text-muted-foreground">
          Centralt beläget i Oxelösund med bekväma öppettider
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="bg-salon-card border-salon-card p-6 text-center">
          <Clock className="w-12 h-12 text-salon-green mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">Öppettider</h3>
          <p className="text-muted-foreground mb-2">Måndag – Söndag</p>
          <p className="text-salon-green font-bold text-lg">10:00 – 19:00</p>
          <p className="text-sm text-muted-foreground mt-2">Alla dagar i veckan</p>
        </Card>
        
        <Card className="bg-salon-card border-salon-card p-6 text-center">
          <Scissors className="w-12 h-12 text-salon-green mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">Vad vi gör</h3>
          <p className="text-muted-foreground mb-2">Vi stylar, färgar, klipper och tar hand om hår.</p>
          <p className="text-salon-green font-bold">Vår specialitet är hårklippning.</p>
          <p className="text-sm text-muted-foreground mt-2">Professionell service</p>
        </Card>
        
        <Card className="bg-salon-card border-salon-card p-6 text-center">
          <MapPin className="w-12 h-12 text-salon-green mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3">Kontakta oss</h3>
          <p className="text-muted-foreground mb-2">Esplanaden 1B</p>
          <p className="text-muted-foreground mb-3">Oxelösund</p>
          <a 
            href="tel:0793488688" 
            className="inline-flex items-center gap-2 text-salon-green hover:text-salon-green-muted transition-colors font-semibold"
          >
            <Phone className="w-4 h-4" />
            0793488688
          </a>
        </Card>
      </div>
    </section>
  );
};

export default Contact;