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

// Simple in-memory rate limiting (resets on function cold start)
// For production, consider using a persistent store like Redis or Supabase
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback - not ideal but better than nothing
  return 'unknown';
}

function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 3600000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!record || record.resetTime < now) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP, 10, 3600000); // 10 requests per hour
    
    if (!rateLimit.allowed) {
      console.log(`[manage-booking] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '3600'
          } 
        }
      );
    }

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

    console.log(`[manage-booking] Action: ${action}, IP: ${clientIP}, Rate limit remaining: ${rateLimit.remaining}`);

    if (action === 'search') {
      // Search for bookings by email
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .ilike('email', normalizedEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[manage-booking] Search error:', error);
        // Generic error message to prevent information leakage
        return new Response(
          JSON.stringify({ error: 'Unable to process request' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Always return success with bookings array (empty if none found)
      // This prevents email enumeration - same response whether email exists or not
      console.log(`[manage-booking] Search completed for IP: ${clientIP}`);

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
        .select('email')
        .eq('id', bookingId)
        .maybeSingle();

      // Use consistent error message to prevent enumeration
      if (fetchError || !booking || booking.email.toLowerCase() !== normalizedEmail) {
        console.error('[manage-booking] Update authorization failed');
        return new Response(
          JSON.stringify({ error: 'Unable to find or access this booking' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          JSON.stringify({ error: 'Unable to process request' }),
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
        .select('email')
        .eq('id', bookingId)
        .maybeSingle();

      // Use consistent error message to prevent enumeration
      if (fetchError || !booking || booking.email.toLowerCase() !== normalizedEmail) {
        console.error('[manage-booking] Delete authorization failed');
        return new Response(
          JSON.stringify({ error: 'Unable to find or access this booking' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          JSON.stringify({ error: 'Unable to process request' }),
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
      JSON.stringify({ error: 'Unable to process request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
