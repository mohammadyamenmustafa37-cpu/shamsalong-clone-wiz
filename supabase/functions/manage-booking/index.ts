import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingUpdate {
  service?: string;
  preferred_date?: string;
  preferred_time?: string;
  notes?: string;
  status?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, email, bookingId, updates } = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`[manage-booking] Action: ${action}, Email: ${normalizedEmail}`);

    if (action === 'search') {
      // Search for bookings by email
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .ilike('customer_email', normalizedEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[manage-booking] Search error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to search bookings' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[manage-booking] Found ${data?.length || 0} bookings`);

      return new Response(
        JSON.stringify({ bookings: data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update') {
      if (!bookingId) {
        return new Response(
          JSON.stringify({ error: 'Booking ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify booking belongs to this email
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('customer_email')
        .eq('id', bookingId)
        .single();

      if (fetchError || !booking) {
        console.error('[manage-booking] Booking not found:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Booking not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify email ownership
      if (booking.customer_email.toLowerCase() !== normalizedEmail) {
        console.error('[manage-booking] Email mismatch');
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Email does not match booking' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update the booking
      const { data, error } = await supabase
        .from('bookings')
        .update(updates as BookingUpdate)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        console.error('[manage-booking] Update error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update booking' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[manage-booking] Updated booking ${bookingId}`);

      return new Response(
        JSON.stringify({ booking: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete') {
      if (!bookingId) {
        return new Response(
          JSON.stringify({ error: 'Booking ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify booking belongs to this email
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('customer_email')
        .eq('id', bookingId)
        .single();

      if (fetchError || !booking) {
        console.error('[manage-booking] Booking not found:', fetchError);
        return new Response(
          JSON.stringify({ error: 'Booking not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify email ownership
      if (booking.customer_email.toLowerCase() !== normalizedEmail) {
        console.error('[manage-booking] Email mismatch');
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Email does not match booking' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete the booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) {
        console.error('[manage-booking] Delete error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete booking' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[manage-booking] Deleted booking ${bookingId}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[manage-booking] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
