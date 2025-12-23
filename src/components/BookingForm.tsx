import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const services = [
  "Herrklippning (Haircut)",
  "Skäggtrimning (Beard Trim)",
  "Hårfärgning (Hair Coloring)",
  "Klippning + Skägg (Haircut + Beard)",
  "Premium styling",
];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

const BookingForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    service: "",
    preferred_date: "",
    preferred_time: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_email || !formData.service || 
        !formData.preferred_date || !formData.preferred_time) {
      toast({
        title: "Fel",
        description: "Vänligen fyll i alla fält.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await (supabase as any)
        .from('bookings')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      supabase.functions.invoke('send-booking-notification', {
        body: {
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          service: formData.service,
          preferred_date: formData.preferred_date,
          preferred_time: formData.preferred_time,
          status: 'pending'
        }
      }).catch(err => console.error('Error sending notification:', err));

      toast({
        title: "Bokning bekräftad!",
        description: "Din bokning har registrerats.",
      });

      setFormData({
        customer_name: "",
        customer_email: "",
        service: "",
        preferred_date: "",
        preferred_time: "",
      });
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
            <Label htmlFor="customer_name" className="text-foreground text-sm font-medium mb-2 block">
              Namn
            </Label>
            <Input
              id="customer_name"
              name="customer_name"
              type="text"
              value={formData.customer_name}
              onChange={handleInputChange}
              className="bg-input border-border h-12"
            />
          </div>

          <div>
            <Label htmlFor="customer_email" className="text-foreground text-sm font-medium mb-2 block">
              E-post
            </Label>
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={handleInputChange}
              className="bg-input border-border h-12"
            />
          </div>

          <div>
            <Label className="text-foreground text-sm font-medium mb-2 block">
              Tjänst
            </Label>
            <Select onValueChange={(value) => handleSelectChange('service', value)} value={formData.service}>
              <SelectTrigger className="bg-input border-border h-12">
                <SelectValue placeholder="Välj en tjänst" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {services.map((service) => (
                  <SelectItem 
                    key={service} 
                    value={service}
                  >
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preferred_date" className="text-foreground text-sm font-medium mb-2 block">
              Datum
            </Label>
            <Input
              id="preferred_date"
              name="preferred_date"
              type="date"
              value={formData.preferred_date}
              onChange={handleInputChange}
              className="bg-input border-border h-12"
            />
          </div>

          <div>
            <Label className="text-foreground text-sm font-medium mb-2 block">
              Tid
            </Label>
            <Select onValueChange={(value) => handleSelectChange('preferred_time', value)} value={formData.preferred_time}>
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

          <Button 
            type="submit"
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 mt-2"
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
