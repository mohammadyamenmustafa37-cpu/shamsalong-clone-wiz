import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, CreditCard, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  payment_method?: string;
  payment_status?: string;
}

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

const BookingsTable = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({
    service: "",
    date: "",
    time: "",
    message: "",
    status: "",
    payment_status: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Only fetch bookings that have been prepaid via Swish
      const { data, error } = await (supabase as any)
        .from('bookings')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const getPaymentBadge = (booking: Booking) => {
    const method = booking.payment_method || 'pay_later';
    const status = booking.payment_status || 'not_required';
    
    if (method === 'swish') {
      if (status === 'paid') {
        return { variant: 'default' as const, label: 'Swish ✓', icon: Smartphone, color: 'text-green-500' };
      }
      return { variant: 'secondary' as const, label: 'Swish (väntar)', icon: Smartphone, color: 'text-yellow-500' };
    }
    return { variant: 'outline' as const, label: 'På plats', icon: CreditCard, color: 'text-muted-foreground' };
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      service: booking.service,
      date: booking.date,
      time: booking.time,
      message: booking.message || "",
      status: booking.status,
      payment_status: booking.payment_status || "not_required",
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (booking: Booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBooking) return;

    try {
      // Use type assertion to bypass TypeScript error until types are regenerated
      const { error } = await (supabase as any)
        .from('bookings')
        .delete()
        .eq('id', selectedBooking.id);

      if (error) throw error;

      toast({
        title: "Bokning raderad",
        description: "Bokningen har raderats framgångsrikt.",
      });

      fetchBookings();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Fel",
        description: "Kunde inte radera bokningen. Försök igen.",
        variant: "destructive",
      });
    }
  };

  const saveEdit = async () => {
    if (!selectedBooking) return;

    try {
      // Use type assertion to bypass TypeScript error until types are regenerated
      const { error } = await (supabase as any)
        .from('bookings')
        .update({
          service: editForm.service,
          date: editForm.date,
          time: editForm.time,
          message: editForm.message,
          status: editForm.status,
          payment_status: editForm.payment_status,
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      toast({
        title: "Bokning uppdaterad",
        description: "Bokningen har uppdaterats framgångsrikt.",
      });

      fetchBookings();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera bokningen. Försök igen.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="bg-card border-border p-4 md:p-6">
      <h2 className="font-display text-2xl font-bold mb-6 text-foreground">Bokningar</h2>
      
      {bookings.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Inga bokningar ännu.
        </p>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-secondary/20">
                  <TableHead className="text-primary">Namn</TableHead>
                  <TableHead className="text-primary">Email</TableHead>
                  <TableHead className="text-primary">Telefon</TableHead>
                  <TableHead className="text-primary">Tjänst</TableHead>
                  <TableHead className="text-primary">Datum</TableHead>
                  <TableHead className="text-primary">Tid</TableHead>
                  <TableHead className="text-primary">Status</TableHead>
                  <TableHead className="text-primary">Betalning</TableHead>
                  <TableHead className="text-primary">Anteckningar</TableHead>
                  <TableHead className="text-primary">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow 
                    key={booking.id}
                    className="border-border hover:bg-secondary/20"
                  >
                    <TableCell className="font-medium">{booking.name}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{booking.phone || '-'}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>{new Date(booking.date).toLocaleDateString('sv-SE')}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const paymentInfo = getPaymentBadge(booking);
                        const Icon = paymentInfo.icon;
                        return (
                          <Badge variant={paymentInfo.variant} className="flex items-center gap-1 w-fit">
                            <Icon className={`h-3 w-3 ${paymentInfo.color}`} />
                            {paymentInfo.label}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {booking.message || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(booking)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(booking)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-background border-border p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{booking.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.email}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {booking.phone && (
                      <div className="flex justify-between">
                        <span className="text-primary font-medium">Telefon:</span>
                        <span>{booking.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-primary font-medium">Tjänst:</span>
                      <span>{booking.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary font-medium">Datum:</span>
                      <span>{new Date(booking.date).toLocaleDateString('sv-SE')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary font-medium">Tid:</span>
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-medium">Betalning:</span>
                      {(() => {
                        const paymentInfo = getPaymentBadge(booking);
                        const Icon = paymentInfo.icon;
                        return (
                          <Badge variant={paymentInfo.variant} className="flex items-center gap-1">
                            <Icon className={`h-3 w-3 ${paymentInfo.color}`} />
                            {paymentInfo.label}
                          </Badge>
                        );
                      })()}
                    </div>
                    {booking.message && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-primary font-medium">Meddelande:</span>
                        <p className="mt-1 text-muted-foreground">{booking.message}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(booking)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Redigera
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(booking)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Radera
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Redigera bokning</DialogTitle>
            <DialogDescription>
              Uppdatera bokningsinformation för {selectedBooking?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="service">Tjänst</Label>
              <Select
                value={editForm.service}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, service: value })
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Välj tjänst" />
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
            <div className="grid gap-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
                className="bg-input border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Tid</Label>
              <Input
                id="time"
                type="time"
                value={editForm.time}
                onChange={(e) =>
                  setEditForm({ ...editForm, time: e.target.value })
                }
                className="bg-input border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Välj status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedBooking?.payment_method === 'swish' && (
              <div className="grid gap-2">
                <Label htmlFor="payment_status">Betalningsstatus (Swish)</Label>
                <Select
                  value={editForm.payment_status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, payment_status: value })
                  }
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Välj betalningsstatus" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="pending">Väntar på betalning</SelectItem>
                    <SelectItem value="paid">Betald</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="message">Meddelande</Label>
              <Textarea
                id="message"
                value={editForm.message}
                onChange={(e) =>
                  setEditForm({ ...editForm, message: e.target.value })
                }
                placeholder="Eventuellt meddelande..."
                className="bg-input border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={saveEdit} className="bg-primary hover:bg-primary/90">
              Spara ändringar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Detta kommer att permanent radera bokningen för{" "}
              {selectedBooking?.name}. Denna åtgärd kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Radera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default BookingsTable;
