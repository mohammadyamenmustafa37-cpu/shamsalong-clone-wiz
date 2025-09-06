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
  { name: "Herrklippning + skägg + tradning och wax", price: "550kr" },
];

const Services = () => {
  return (
    <section className="px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Våra Tjänster</h2>
        <p className="text-xl text-muted-foreground">
          Professionell hårklippning och styling med högsta kvalitet till rättvisa priser
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-4">
        {services.map((service, index) => (
          <Card 
            key={index} 
            className="bg-salon-card border-salon-card hover:bg-salon-card-hover transition-colors p-6 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-salon-green/20 rounded-lg group-hover:bg-salon-green/30 transition-colors">
                  <Scissors className="w-5 h-5 text-salon-green" />
                </div>
                <span className="text-lg font-medium">{service.name}</span>
              </div>
              <span className="text-xl font-bold text-salon-green">{service.price}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Services;