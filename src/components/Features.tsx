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
    <section className="px-6 py-16 md:py-24 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-card border-border p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
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
