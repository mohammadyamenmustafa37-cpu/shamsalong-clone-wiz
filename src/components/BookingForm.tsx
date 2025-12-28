import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const services = [
  "Pensionär klippning (Herr)",
  "Pensionär klippning (Dam)",
  "Fade klippning (Herr)",
  "Fade klippning (Barn)",
  "Herr klippning",
  "Herr klippning + Skägg",
  "Fade skägg (Herr)",
  "Rakning av Skägg",
  "Herrklippning + skägg + trådning och wax",
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
    service: "",
    date: "",
    time: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.service || 
        !formData.date || !formData.time) {
      toast({
        title: "Fel",
        description: "Vänligen fyll i alla obligatoriska fält.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
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
          service: formData.service,
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
        service: "",
        date: "",
        time: "",
        message: "",
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
            <Label className="text-foreground text-sm font-medium mb-2 block">
              Tjänst *
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
