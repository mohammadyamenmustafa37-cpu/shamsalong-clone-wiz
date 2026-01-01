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

// Swish phone number - format: digits only for deep link
const SWISH_NUMBER = "123 071 15 72";
const SWISH_NUMBER_CLEAN = "1230711572";
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
      await navigator.clipboard.writeText(SWISH_NUMBER_CLEAN);
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

  const openSwishApp = () => {
    const amount = getTotalPrice();
    const message = `${formData.name || "Bokning"} - ${formData.date || ""}`;
    
    // Create Swish payment data
    const paymentData = {
      version: 1,
      payee: { value: SWISH_NUMBER_CLEAN },
      amount: { value: amount },
      message: { value: message.substring(0, 50) } // Swish message limit
    };
    
    // Base64 encode the payment data
    const encodedData = btoa(JSON.stringify(paymentData));
    const swishUrl = `swish://payment?data=${encodedData}`;
    
    // Try to open Swish app
    window.location.href = swishUrl;
    
    // Show fallback message after a short delay
    setTimeout(() => {
      toast({
        title: "Swish-appen öppnas",
        description: "Om appen inte öppnades, använd numret nedan för att betala manuellt.",
      });
    }, 1500);
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
                    <div className="mt-4 p-5 bg-muted/50 rounded-lg border border-border">
                      {/* Swish Button */}
                      <button
                        type="button"
                        onClick={openSwishApp}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#47b973] hover:bg-[#3da864] text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg mb-4"
                      >
                        <svg 
                          viewBox="0 0 24 24" 
                          className="w-7 h-7"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                        </svg>
                        <span className="text-lg">Öppna Swish & betala {getTotalPrice()}kr</span>
                      </button>

                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-3">
                          Fungerar det inte? Swisha manuellt till:
                        </p>
                        <div className="flex items-center justify-center gap-2 bg-background/50 py-2 px-4 rounded-lg">
                          <span className="text-lg font-bold text-foreground tracking-wider">
                            {SWISH_NUMBER}
                          </span>
                          <button
                            type="button"
                            onClick={copySwishNumber}
                            className="p-1.5 hover:bg-muted rounded-md transition-colors"
                            title="Kopiera nummer"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Belopp: <span className="font-semibold">{getTotalPrice()}kr</span>
                        </p>
                      </div>
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
