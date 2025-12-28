import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Trash2, Save, X, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

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

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string;
  date: string;
  time: string;
  message: string | null;
  status: string;
  created_at: string;
}

type Step = 'email' | 'otp' | 'bookings';

const BookingManagement = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Booking>>({});

  const sendOtp = async () => {
    if (!email) {
      toast({
        title: "Fel",
        description: "Vänligen ange din e-postadress.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          action: 'send',
          email: email.trim().toLowerCase()
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Kod skickad!",
        description: "Kontrollera din e-post för verifieringskoden.",
      });
      
      setStep('otp');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte skicka verifieringskod. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Fel",
        description: "Ange hela 6-siffriga koden.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          action: 'verify',
          email: email.trim().toLowerCase(),
          otp
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.sessionToken) {
        setSessionToken(data.sessionToken);
        await fetchBookings();
        setStep('bookings');
        toast({
          title: "Verifierad!",
          description: "Du kan nu hantera dina bokningar.",
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Fel",
        description: error.message || "Felaktig verifieringskod. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-booking', {
        body: {
          action: 'search',
          email: email.trim().toLowerCase()
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      setBookings(data?.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta bokningar. Försök igen senare.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (booking: Booking) => {
    setEditingId(booking.id);
    setEditForm({
      name: booking.name,
      phone: booking.phone,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      message: booking.message,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (bookingId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-booking', {
        body: {
          action: 'update',
          email: email.trim().toLowerCase(),
          bookingId,
          updates: editForm
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...editForm }
          : booking
      ));

      setEditingId(null);
      setEditForm({});

      toast({
        title: "Bokning uppdaterad!",
        description: "Dina ändringar har sparats.",
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera bokningen. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Är du säker på att du vill avboka? Detta kan inte ångras.")) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-booking', {
        body: {
          action: 'delete',
          email: email.trim().toLowerCase(),
          bookingId
        }
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      setBookings(bookings.filter(booking => booking.id !== bookingId));

      toast({
        title: "Bokning avbokad",
        description: "Din bokning har avbokats.",
      });
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast({
        title: "Fel",
        description: "Kunde inte avboka. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const resetFlow = () => {
    setStep('email');
    setOtp('');
    setSessionToken(null);
    setBookings([]);
    setEditingId(null);
    setEditForm({});
  };

  return (
    <section className="px-6 py-12">
      <Card className="bg-card border-border p-8 max-w-4xl mx-auto">
        {step === 'email' && (
          <div className="text-center">
            <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Hantera Dina Bokningar</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Ange din e-postadress så skickar vi en verifieringskod.
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <div className="text-left">
                <Label htmlFor="email">E-postadress</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din.email@exempel.se"
                  className="bg-input border-border"
                  onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                />
              </div>
              <Button
                onClick={sendOtp}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {loading ? "Skickar..." : "Skicka verifieringskod"}
              </Button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="text-center">
            <KeyRound className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ange verifieringskod</h2>
            <p className="text-muted-foreground text-lg mb-2">
              Vi har skickat en 6-siffrig kod till:
            </p>
            <p className="text-primary font-medium mb-8">{email}</p>

            <div className="max-w-md mx-auto space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {loading ? "Verifierar..." : "Verifiera"}
              </Button>

              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  onClick={sendOtp}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skicka ny kod
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep('email')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ändra e-postadress
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'bookings' && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Calendar className="w-12 h-12 text-primary mb-2" />
                <h2 className="text-2xl font-bold">Dina Bokningar</h2>
                <p className="text-muted-foreground">{email}</p>
              </div>
              <Button
                variant="outline"
                onClick={resetFlow}
                className="border-border hover:bg-secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Logga ut
              </Button>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Inga bokningar hittades för denna e-postadress.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="bg-background border-border p-6">
                    {editingId === booking.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Namn</Label>
                            <Input
                              value={editForm.name || ""}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="bg-input border-border"
                            />
                          </div>
                          <div>
                            <Label>Telefon</Label>
                            <Input
                              value={editForm.phone || ""}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="bg-input border-border"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Tjänst</Label>
                          <Select 
                            value={editForm.service} 
                            onValueChange={(value) => setEditForm({ ...editForm, service: value })}
                          >
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              {services.map((service) => (
                                <SelectItem key={service} value={service}>
                                  {service}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Datum</Label>
                            <Input
                              type="date"
                              value={editForm.date || ""}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              className="bg-input border-border"
                            />
                          </div>
                          <div>
                            <Label>Tid</Label>
                            <Input
                              type="time"
                              value={editForm.time || ""}
                              onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                              className="bg-input border-border"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Meddelande</Label>
                          <Textarea
                            value={editForm.message || ""}
                            onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                            className="bg-input border-border"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => saveEdit(booking.id)}
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Spara
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            className="border-border hover:bg-secondary"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Avbryt
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold">{booking.name}</h4>
                            <p className="text-primary font-medium">{booking.service}</p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Datum:</span>
                            <p>{new Date(booking.date).toLocaleDateString('sv-SE')}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tid:</span>
                            <p>{booking.time}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Telefon:</span>
                            <p>{booking.phone || '-'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Bokad:</span>
                            <p>{new Date(booking.created_at).toLocaleDateString('sv-SE')}</p>
                          </div>
                        </div>

                        {booking.message && (
                          <div className="mb-4">
                            <span className="text-muted-foreground text-sm">Meddelande:</span>
                            <p className="text-sm">{booking.message}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => startEdit(booking)}
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Ändra
                          </Button>
                          <Button
                            onClick={() => cancelBooking(booking.id)}
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Avboka
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </section>
  );
};

export default BookingManagement;
