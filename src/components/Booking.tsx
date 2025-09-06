import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const Booking = () => {
  return (
    <section className="px-6 py-12">
      <Card className="bg-salon-card border-salon-card p-8 text-center max-w-2xl mx-auto">
        <div className="mb-6">
          <Calendar className="w-16 h-16 text-salon-purple mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Boka Tid</h2>
          <p className="text-muted-foreground text-lg">
            Boka enkelt din tid via vår Calendly-länk. Välj den tjänst som passar dig bäst.
          </p>
        </div>
        
        <Button 
          size="lg" 
          className="bg-salon-green hover:bg-salon-green-muted text-salon-purple-dark font-semibold text-lg px-8 py-6 mb-4"
          onClick={() => window.open('https://calendly.com/mohammadyamenmustafa37', '_blank')}
        >
          Boka Nu
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Snabb och enkel bokning online
        </p>
      </Card>
    </section>
  );
};

export default Booking;