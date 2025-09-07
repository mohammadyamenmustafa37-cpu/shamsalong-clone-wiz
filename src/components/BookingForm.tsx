import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const services = [
  "Pensionär klippning (Herr) - 300kr",
  "Pensionär klippning (Dam) - 400kr",
  "Fade klippning (Herr) - 400kr",
  "Fade klippning (Barn) - 300kr",
  "Herr klippning - 400kr",
  "Herr klippning + Skägg - 450kr",
  "Fade skägg (Herr) - 200kr",
  "Rakning av Skägg - 150kr",
  "Herrklippning + skägg + trådning och wax - 550kr",
];

const timeSlots = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
];

const BookingForm = () => {
  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    service: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.phone_number || !formData.service || 
        !formData.appointment_date || !formData.appointment_time) {
      toast({
        title: "Ofullständig information",
        description: "Vänligen fyll i alla fält",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: formData
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "Bokningsfel",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Bokning bekräftad!",
        description: data.message || "Din bokning har skapats och en SMS-bekräftelse skickas till dig.",
      });

      // Reset form
      setFormData({
        customer_name: "",
        phone_number: "",
        service: "",
        appointment_date: "",
        appointment_time: "",
      });

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Bokningsfel",
        description: "Ett fel uppstod vid bokning. Försök igen eller ring oss.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Card className="bg-salon-card border-salon-card p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-salon-purple mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Boka Tid</h2>
        <p className="text-muted-foreground">
          Fyll i formuläret nedan så bekräftar vi din bokning via SMS
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-salon-green" />
              Ditt namn
            </Label>
            <Input
              id="name"
              value={formData.customer_name}
              onChange={(e) => handleInputChange("customer_name", e.target.value)}
              placeholder="Ange ditt fullständiga namn"
              className="bg-salon-card-hover border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-salon-green" />
              Telefonnummer
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
              placeholder="070-123 45 67"
              className="bg-salon-card-hover border-border"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-salon-green" />
            Välj tjänst
          </Label>
          <Select onValueChange={(value) => handleInputChange("service", value)} required>
            <SelectTrigger className="bg-salon-card-hover border-border">
              <SelectValue placeholder="Välj en tjänst" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service, index) => (
                <SelectItem key={index} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-salon-green" />
              Datum
            </Label>
            <Input
              id="date"
              type="date"
              min={minDate}
              value={formData.appointment_date}
              onChange={(e) => handleInputChange("appointment_date", e.target.value)}
              className="bg-salon-card-hover border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-salon-green" />
              Tid
            </Label>
            <Select onValueChange={(value) => handleInputChange("appointment_time", value)} required>
              <SelectTrigger className="bg-salon-card-hover border-border">
                <SelectValue placeholder="Välj tid" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-salon-green hover:bg-salon-green-muted text-salon-purple-dark font-semibold text-lg py-6"
        >
          {isLoading ? "Bokar..." : "Bekräfta Bokning"}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Du kommer att få en SMS-bekräftelse med alla detaljer om din bokning
        </p>
      </form>
    </Card>
  );
};

export default BookingForm;