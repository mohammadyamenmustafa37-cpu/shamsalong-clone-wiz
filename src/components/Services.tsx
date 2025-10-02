import { Scissors } from "lucide-react";
import { Card } from "@/components/ui/card";

const services = [
  { name: "Pensionär klippning (Herr)", price: "300kr" },
  { name: "Pensionär klippning (Dam)", price: "400kr" },
  { name: "Fade klippning (Herr)", price: "400kr" },
  { name: "Fade klippning (Barn)", price: "300kr" },
  { name: "Herr klippning", price: "400kr" },
  { name: "Herr klippning + Skägg", price: "450kr" },
  { name: "Fade skägg (Herr)", price: "200kr" },
  { name: "Rakning av Skägg", price: "150kr" },
  { name: "Herrklippning + skägg + trådning och wax", price: "550kr" },
];

const Services = () => {
  return (
    <section className="px-4 md:px-6 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Våra Tjänster</h2>
        <p className="text-base md:text-xl text-muted-foreground px-4">
          Professionell hårklippning och styling med högsta kvalitet till rättvisa priser
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
        {services.map((service, index) => (
          <Card 
            key={index} 
            className="bg-salon-card border-border hover:bg-salon-card-hover transition-colors p-4 md:p-6 group cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-salon-gold/20 rounded-lg group-hover:bg-salon-gold/30 transition-colors flex-shrink-0">
                  <Scissors className="w-4 h-4 md:w-5 md:h-5 text-salon-gold" />
                </div>
                <span className="text-sm md:text-lg font-medium truncate">{service.name}</span>
              </div>
              <span className="text-lg md:text-xl font-bold text-salon-gold whitespace-nowrap">{service.price}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Services;