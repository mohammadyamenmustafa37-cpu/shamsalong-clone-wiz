import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, X, Plus, Smartphone, CreditCard, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Swish phone number - update this with your actual Swish number
const SWISH_NUMBER = "070-XXX XX XX";
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
  const [currentService, setCurrentService] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"later" | "swish">("later");
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addService = () => {
    if (currentService && !selectedServices.includes(currentService)) {
      setSelectedServices(prev => [...prev, currentService]);
      setCurrentService("");
    }
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

  const copySwishNumber = async () => {
    try {
      await navigator.clipboard.writeText(SWISH_NUMBER.replace(/-/g, "").replace(/ /g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Kopierat!",
        description: "Swish-numret har kopierats till urklipp.",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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
            <Label className="text-foreground text-sm font-medium mb-2 block">
              Tjänst *
            </Label>
            <div className="flex gap-2">
              <Select value={currentService} onValueChange={setCurrentService}>
                <SelectTrigger className="bg-input border-border h-12 flex-1">
                  <SelectValue placeholder="Välj en tjänst" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {services.map((service) => (
                    <SelectItem 
                      key={service.name} 
                      value={service.name}
                      disabled={selectedServices.includes(service.name)}
                    >
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={addService}
                disabled={!currentService}
                className="h-12 px-4"
              >
                <Plus className="w-5 h-5" />
              </Button>
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

                {/* Payment Method Section */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-base font-medium text-foreground mb-4">Välj betalningsmetod</h4>
                  
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(value) => setPaymentMethod(value as "later" | "swish")}
                    className="space-y-3"
                  >
                    <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      paymentMethod === "later" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}>
                      <RadioGroupItem value="later" id="pay-later" />
                      <Label htmlFor="pay-later" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Betala på plats</p>
                          <p className="text-sm text-muted-foreground">Betala vid ankomst till salongen</p>
                        </div>
                      </Label>
                    </div>

                    <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      paymentMethod === "swish" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}>
                      <RadioGroupItem value="swish" id="pay-swish" className="mt-1" />
                      <Label htmlFor="pay-swish" className="flex items-start gap-3 cursor-pointer flex-1">
                        <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Betala nu med Swish</p>
                          <p className="text-sm text-muted-foreground">Förskottsbetala för att säkra din tid</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Swish Payment Details */}
                  {paymentMethod === "swish" && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-12 h-12 bg-[#47b973] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">S</span>
                        </div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mb-2">
                        Swisha <span className="font-bold text-primary">{getTotalPrice()}kr</span> till:
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-foreground tracking-wider">
                          {SWISH_NUMBER}
                        </span>
                        <button
                          type="button"
                          onClick={copySwishNumber}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="Kopiera nummer"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <p className="text-center text-xs text-muted-foreground mt-3">
                        Skriv ditt namn och bokningsdatum som meddelande
                      </p>
                    </div>
                  )}
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
