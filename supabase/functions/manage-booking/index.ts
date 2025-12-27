import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Zod schemas for input validation
const emailSchema = z.string().email().max(255).transform(val => val.trim().toLowerCase());
const uuidSchema = z.string().uuid();
const actionSchema = z.enum(['search', 'update', 'delete']);

const updateSchema = z.object({
  service: z.string().max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  message: z.string().max(500).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
}).strict(); // Reject unknown fields

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

    const body = await req.json();

    // Validate action
    const actionResult = actionSchema.safeParse(body.action);
    if (!actionResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const action = actionResult.data;

    // Validate email
    const emailResult = emailSchema.safeParse(body.email);
    if (!emailResult.success) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const normalizedEmail = emailResult.data;

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
      // Validate bookingId as UUID
      const bookingIdResult = uuidSchema.safeParse(body.bookingId);
      if (!bookingIdResult.success) {
        return new Response(
          JSON.stringify({ error: 'Valid booking ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const bookingId = bookingIdResult.data;

      // Validate updates object
      const updatesResult = updateSchema.safeParse(body.updates);
      if (!updatesResult.success) {
        console.log('[manage-booking] Invalid updates object:', updatesResult.error.errors);
        return new Response(
          JSON.stringify({ error: 'Invalid update data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const validatedUpdates = updatesResult.data;

      // Check if there's anything to update
      if (Object.keys(validatedUpdates).length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid fields to update' }),
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

      // Update the booking with validated data
      const { data, error } = await supabase
        .from('bookings')
        .update(validatedUpdates)
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
      // Validate bookingId as UUID
      const bookingIdResult = uuidSchema.safeParse(body.bookingId);
      if (!bookingIdResult.success) {
        return new Response(
          JSON.stringify({ error: 'Valid booking ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const bookingId = bookingIdResult.data;

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
