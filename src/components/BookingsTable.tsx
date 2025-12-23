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
import { Loader2, Pencil, Trash2 } from "lucide-react";
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

const services = [
  "Herrklippning (Haircut)",
  "Skäggtrimning (Beard Trim)",
  "Hårfärgning (Hair Coloring)",
  "Klippning + Skägg (Haircut + Beard)",
  "Premium styling",
];

const BookingsTable = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({
    service: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
    status: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Use type assertion to bypass TypeScript error until types are regenerated
      const { data, error } = await (supabase as any)
        .from('bookings')
        .select('*')
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

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      service: booking.service,
      preferred_date: booking.preferred_date,
      preferred_time: booking.preferred_time,
      notes: booking.notes || "",
      status: booking.status,
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
          preferred_date: editForm.preferred_date,
          preferred_time: editForm.preferred_time,
          notes: editForm.notes,
          status: editForm.status,
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
                    <TableCell className="font-medium">{booking.customer_name}</TableCell>
                    <TableCell>{booking.customer_email}</TableCell>
                    <TableCell>{booking.customer_phone || '-'}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>{new Date(booking.preferred_date).toLocaleDateString('sv-SE')}</TableCell>
                    <TableCell>{booking.preferred_time}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {booking.notes || '-'}
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
                      <p className="font-semibold text-lg">{booking.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {booking.customer_phone && (
                      <div className="flex justify-between">
                        <span className="text-primary font-medium">Telefon:</span>
                        <span>{booking.customer_phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-primary font-medium">Tjänst:</span>
                      <span>{booking.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary font-medium">Datum:</span>
                      <span>{new Date(booking.preferred_date).toLocaleDateString('sv-SE')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary font-medium">Tid:</span>
                      <span>{booking.preferred_time}</span>
                    </div>
                    {booking.notes && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-primary font-medium">Anteckningar:</span>
                        <p className="mt-1 text-muted-foreground">{booking.notes}</p>
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
              Uppdatera bokningsinformation för {selectedBooking?.customer_name}
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
                value={editForm.preferred_date}
                onChange={(e) =>
                  setEditForm({ ...editForm, preferred_date: e.target.value })
                }
                className="bg-input border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Tid</Label>
              <Input
                id="time"
                type="time"
                value={editForm.preferred_time}
                onChange={(e) =>
                  setEditForm({ ...editForm, preferred_time: e.target.value })
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
            <div className="grid gap-2">
              <Label htmlFor="notes">Anteckningar</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                placeholder="Eventuella anteckningar..."
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
              {selectedBooking?.customer_name}. Denna åtgärd kan inte ångras.
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
