import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock } from "lucide-react";
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

const BookingForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, service: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_email || !formData.service || 
        !formData.preferred_date || !formData.preferred_time) {
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
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Bokning bekräftad!",
        description: "Din bokning har registrerats. Vi kommer att bekräfta din tid inom kort.",
      });

      // Reset form
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        service: "",
        preferred_date: "",
        preferred_time: "",
        notes: "",
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Fel",
        description: "Något gick fel. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-12">
      <Card className="bg-salon-card border-salon-card p-8 max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <Calendar className="w-16 h-16 text-salon-purple mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Boka Tid</h2>
          <p className="text-muted-foreground text-lg">
            Fyll i formuläret nedan för att boka din tid. Vi bekräftar din bokning via email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Namn *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                type="text"
                value={formData.customer_name}
                onChange={handleInputChange}
                required
                className="bg-background border-salon-card focus:border-salon-green"
              />
            </div>
            <div>
              <Label htmlFor="customer_email">Email *</Label>
              <Input
                id="customer_email"
                name="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={handleInputChange}
                required
                className="bg-background border-salon-card focus:border-salon-green"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customer_phone">Telefonnummer</Label>
            <Input
              id="customer_phone"
              name="customer_phone"
              type="tel"
              value={formData.customer_phone}
              onChange={handleInputChange}
              className="bg-background border-salon-card focus:border-salon-green"
            />
          </div>

          <div>
            <Label htmlFor="service">Välj tjänst *</Label>
            <Select onValueChange={handleSelectChange} value={formData.service}>
              <SelectTrigger className="bg-background border-salon-card focus:border-salon-green">
                <SelectValue placeholder="Välj en tjänst" />
              </SelectTrigger>
              <SelectContent className="bg-salon-card border-salon-card">
                {services.map((service) => (
                  <SelectItem key={service} value={service} className="hover:bg-salon-card-hover">
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferred_date">Önskat datum *</Label>
              <Input
                id="preferred_date"
                name="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={handleInputChange}
                required
                className="bg-background border-salon-card focus:border-salon-green"
              />
            </div>
            <div>
              <Label htmlFor="preferred_time">Önskad tid *</Label>
              <Input
                id="preferred_time"
                name="preferred_time"
                type="time"
                value={formData.preferred_time}
                onChange={handleInputChange}
                required
                className="bg-background border-salon-card focus:border-salon-green"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Anteckningar</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Eventuella önskemål eller anteckningar..."
              className="bg-background border-salon-card focus:border-salon-green min-h-[100px]"
            />
          </div>

          <Button 
            type="submit"
            size="lg" 
            className="w-full bg-salon-green hover:bg-salon-green-muted text-salon-purple-dark font-semibold text-lg py-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Skickar bokning...
              </>
            ) : (
              "Boka Nu"
            )}
          </Button>
        </form>
      </Card>
    </section>
  );
};

export default BookingForm;