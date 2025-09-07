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
    <Card className="bg-salon-card border-salon-card p-6">
      <h2 className="text-2xl font-bold mb-6 text-salon-purple">Bokningar</h2>
      
      {bookings.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Inga bokningar ännu.
        </p>
      ) : (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-salon-card hover:bg-salon-card-hover">
                <TableHead className="text-salon-green">Namn</TableHead>
                <TableHead className="text-salon-green">Email</TableHead>
                <TableHead className="text-salon-green">Telefon</TableHead>
                <TableHead className="text-salon-green">Tjänst</TableHead>
                <TableHead className="text-salon-green">Datum</TableHead>
                <TableHead className="text-salon-green">Tid</TableHead>
                <TableHead className="text-salon-green">Status</TableHead>
                <TableHead className="text-salon-green">Anteckningar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow 
                  key={booking.id}
                  className="border-salon-card hover:bg-salon-card-hover"
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
      )}
    </Card>
  );
};

export default BookingsTable;