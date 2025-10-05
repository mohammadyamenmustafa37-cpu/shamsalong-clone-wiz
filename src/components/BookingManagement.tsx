import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Edit, Trash2, Save, X } from "lucide-react";
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

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service: string;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const BookingManagement = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Booking>>({});

  const searchBookings = async () => {
    if (!email) {
      toast({
        title: "Fel",
        description: "Vänligen ange din email-adress.",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
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

      const bookings = data?.bookings || [];
      setBookings(bookings);
      
      if (bookings.length === 0) {
        toast({
          title: "Inga bokningar hittades",
          description: "Vi kunde inte hitta några bokningar med den angivna email-adressen.",
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta bokningar. Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const startEdit = (booking: Booking) => {
    setEditingId(booking.id);
    setEditForm({
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      service: booking.service,
      preferred_date: booking.preferred_date,
      preferred_time: booking.preferred_time,
      notes: booking.notes,
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

      // Update local state
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

  return (
    <section className="px-6 py-12">
      <Card className="bg-salon-card border-salon-card p-8 max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <Calendar className="w-16 h-16 text-salon-purple mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Hantera Dina Bokningar</h2>
          <p className="text-muted-foreground text-lg">
            Ange din email för att visa, ändra eller avboka dina tider.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search-email">Email</Label>
              <Input
                id="search-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din.email@exempel.se"
                className="bg-background border-salon-card focus:border-salon-green"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={searchBookings}
                disabled={searchLoading}
                className="bg-salon-green hover:bg-salon-green-muted text-salon-purple-dark font-semibold"
              >
                {searchLoading ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Söker...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Sök Bokningar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-salon-purple">Dina Bokningar</h3>
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-background border-salon-card p-6">
                {editingId === booking.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Namn</Label>
                        <Input
                          value={editForm.customer_name || ""}
                          onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                          className="bg-salon-card border-salon-card focus:border-salon-green"
                        />
                      </div>
                      <div>
                        <Label>Telefon</Label>
                        <Input
                          value={editForm.customer_phone || ""}
                          onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
                          className="bg-salon-card border-salon-card focus:border-salon-green"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Tjänst</Label>
                      <Select 
                        value={editForm.service} 
                        onValueChange={(value) => setEditForm({ ...editForm, service: value })}
                      >
                        <SelectTrigger className="bg-salon-card border-salon-card focus:border-salon-green">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-salon-card border-salon-card">
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
                          value={editForm.preferred_date || ""}
                          onChange={(e) => setEditForm({ ...editForm, preferred_date: e.target.value })}
                          className="bg-salon-card border-salon-card focus:border-salon-green"
                        />
                      </div>
                      <div>
                        <Label>Tid</Label>
                        <Input
                          type="time"
                          value={editForm.preferred_time || ""}
                          onChange={(e) => setEditForm({ ...editForm, preferred_time: e.target.value })}
                          className="bg-salon-card border-salon-card focus:border-salon-green"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Anteckningar</Label>
                      <Textarea
                        value={editForm.notes || ""}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        className="bg-salon-card border-salon-card focus:border-salon-green"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveEdit(booking.id)}
                        disabled={loading}
                        className="bg-salon-green hover:bg-salon-green-muted text-salon-purple-dark"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Spara
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        variant="outline"
                        className="border-salon-card hover:bg-salon-card"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Avbryt
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">{booking.customer_name}</h4>
                        <p className="text-salon-green font-medium">{booking.service}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Datum:</span>
                        <p>{new Date(booking.preferred_date).toLocaleDateString('sv-SE')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tid:</span>
                        <p>{booking.preferred_time}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Telefon:</span>
                        <p>{booking.customer_phone || '-'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bokad:</span>
                        <p>{new Date(booking.created_at).toLocaleDateString('sv-SE')}</p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-4">
                        <span className="text-muted-foreground text-sm">Anteckningar:</span>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEdit(booking)}
                        variant="outline"
                        size="sm"
                        className="border-salon-green text-salon-green hover:bg-salon-green hover:text-salon-purple-dark"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Ändra
                      </Button>
                      <Button
                        onClick={() => cancelBooking(booking.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
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
      </Card>
    </section>
  );
};

export default BookingManagement;