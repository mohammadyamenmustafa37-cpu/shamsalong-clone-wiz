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
import { Loader2 } from "lucide-react";

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

const BookingsTable = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-salon-purple" />
      </div>
    );
  }

  return (
    <Card className="bg-salon-card border-salon-card p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6 text-salon-gold">Bokningar</h2>
      
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
                <TableRow className="border-border hover:bg-salon-card-hover">
                  <TableHead className="text-salon-gold">Namn</TableHead>
                  <TableHead className="text-salon-gold">Email</TableHead>
                  <TableHead className="text-salon-gold">Telefon</TableHead>
                  <TableHead className="text-salon-gold">Tjänst</TableHead>
                  <TableHead className="text-salon-gold">Datum</TableHead>
                  <TableHead className="text-salon-gold">Tid</TableHead>
                  <TableHead className="text-salon-gold">Status</TableHead>
                  <TableHead className="text-salon-gold">Anteckningar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow 
                    key={booking.id}
                    className="border-border hover:bg-salon-card-hover"
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
                        <span className="text-salon-gold font-medium">Telefon:</span>
                        <span>{booking.customer_phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-salon-gold font-medium">Tjänst:</span>
                      <span>{booking.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-salon-gold font-medium">Datum:</span>
                      <span>{new Date(booking.preferred_date).toLocaleDateString('sv-SE')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-salon-gold font-medium">Tid:</span>
                      <span>{booking.preferred_time}</span>
                    </div>
                    {booking.notes && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-salon-gold font-medium">Anteckningar:</span>
                        <p className="mt-1 text-muted-foreground">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default BookingsTable;