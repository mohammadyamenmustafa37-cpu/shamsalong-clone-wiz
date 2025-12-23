import { Scissors, Clock, User } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Scissors,
    title: "Premium Kvalitet",
    description: "Expertis i varje klipp"
  },
  {
    icon: Clock,
    title: "Flexibla tider",
    description: "Boka när det passar dig"
  },
  {
    icon: User,
    title: "Erfarna Barberare",
    description: "Över 15 års erfarenhet"
  }
];

const Features = () => {
  return (
    <section className="px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-card border-border p-6 md:p-8 text-center group hover:bg-card/80 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary/20 rounded-full mb-4 md:mb-6 group-hover:bg-primary/30 transition-colors">
                <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold mb-2 md:mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-base md:text-lg">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
