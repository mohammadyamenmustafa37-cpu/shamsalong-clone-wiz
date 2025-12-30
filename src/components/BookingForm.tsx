import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const services = [
  { name: "Pensionär klippning (Herr)", price: 300 },
  { name: "Pensionär klippning (Dam)", price: 400 },
  { name: "Fade klippning (Herr)", price: 400 },
  { name: "Fade klippning (Barn)", price: 300 },
  { name: "Herr klippning", price: 400 },
  { name: "Herr klippning + Skägg", price: 450 },
  { name: "Fade skägg (Herr)", price: 200 },
  { name: "Rakning av Skägg", price: 150 },
  { name: "Herrklippning + skägg + trådning och wax", price: 550 },
];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

const BookingForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleService = (serviceName: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceName) 
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const removeService = (serviceName: string) => {
    setSelectedServices(prev => prev.filter(s => s !== serviceName));
  };

  const getTotalPrice = (): number => {
    return selectedServices.reduce((total, serviceName) => {
      const service = services.find(s => s.name === serviceName);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || selectedServices.length === 0 || 
        !formData.date || !formData.time) {
      toast({
        title: "Fel",
        description: "Vänligen fyll i alla obligatoriska fält och välj minst en tjänst.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const serviceString = selectedServices.join(", ");
      
      const { error } = await supabase
        .from('bookings')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: serviceString,
          date: formData.date,
          time: formData.time,
          message: formData.message || null,
        }]);

      if (error) throw error;

      // Try to send notification (non-blocking)
      supabase.functions.invoke('send-booking-notification', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: serviceString,
          date: formData.date,
          time: formData.time,
        }
      }).catch(err => console.error('Error sending notification:', err));

      toast({
        title: "Bokning bekräftad!",
        description: "Din bokning har registrerats. Vi kontaktar dig snart.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        message: "",
      });
      setSelectedServices([]);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Fel",
        description: "Något gick fel. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="px-6 py-16 md:py-24 bg-background">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3 text-foreground">
            Boka Din Tid
          </h2>
          <p className="text-muted-foreground">
            Fyll i formuläret nedan för att boka din tid
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-foreground text-sm font-medium mb-2 block">
              Namn *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="bg-input border-border h-12"
              placeholder="Ditt namn"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground text-sm font-medium mb-2 block">
              E-post *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-input border-border h-12"
              placeholder="din@email.se"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-foreground text-sm font-medium mb-2 block">
              Telefon *
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="bg-input border-border h-12"
              placeholder="070-123 45 67"
            />
          </div>

          <div>
            <Label className="text-foreground text-sm font-medium mb-3 block">
              Tjänster * (välj en eller flera)
            </Label>
            <div className="space-y-2 bg-input border border-border rounded-lg p-4">
              {services.map((service) => (
                <div 
                  key={service.name} 
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={service.name}
                      checked={selectedServices.includes(service.name)}
                      onCheckedChange={() => toggleService(service.name)}
                    />
                    <label 
                      htmlFor={service.name}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {service.name}
                    </label>
                  </div>
                  <span className="text-sm text-muted-foreground">{service.price}kr</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="date" className="text-foreground text-sm font-medium mb-2 block">
              Datum *
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              className="bg-input border-border h-12"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label className="text-foreground text-sm font-medium mb-2 block">
              Tid *
            </Label>
            <Select onValueChange={(value) => handleSelectChange('time', value)} value={formData.time}>
              <SelectTrigger className="bg-input border-border h-12">
                <SelectValue placeholder="Välj tid" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {timeSlots.map((time) => (
                  <SelectItem 
                    key={time} 
                    value={time}
                  >
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message" className="text-foreground text-sm font-medium mb-2 block">
              Meddelande (valfritt)
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className="bg-input border-border min-h-[80px]"
              placeholder="Eventuella önskemål..."
            />
          </div>

          {/* Checkout section at bottom */}
          <div className="mt-8 p-6 bg-card border-2 border-primary/30 rounded-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sammanfattning</h3>
            
            {selectedServices.length > 0 ? (
              <>
                <div className="space-y-2 mb-4">
                  {selectedServices.map((serviceName) => {
                    const service = services.find(s => s.name === serviceName);
                    return (
                      <div key={serviceName} className="flex justify-between items-center py-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeService(serviceName)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-foreground">{serviceName}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{service?.price}kr</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20">
                  <span className="text-lg font-medium text-foreground">Totalt att betala</span>
                  <span className="text-3xl font-bold text-primary">{getTotalPrice()}kr</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Inga tjänster valda ännu</p>
            )}
          </div>

          <Button 
            type="submit"
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Skickar...
              </>
            ) : (
              "Bekräfta bokning"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default BookingForm;
