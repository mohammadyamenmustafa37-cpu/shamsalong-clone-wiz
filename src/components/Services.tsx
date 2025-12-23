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
    <section className="px-4 md:px-6 py-12 md:py-20 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Våra Tjänster
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Professionell hårklippning och styling med högsta kvalitet till rättvisa priser
          </p>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="bg-card border-border hover:bg-secondary/20 transition-all duration-300 p-4 md:p-6 group cursor-pointer animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors flex-shrink-0">
                    <Scissors className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <span className="text-base md:text-lg font-medium text-foreground truncate">
                    {service.name}
                  </span>
                </div>
                <span className="text-lg md:text-xl font-bold text-primary whitespace-nowrap">
                  {service.price}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
