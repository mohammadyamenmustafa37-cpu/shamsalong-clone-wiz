import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation
const emailSchema = z.string().email().max(255).transform((v) => v.trim().toLowerCase());
const actionSchema = z.enum(['search', 'update', 'delete']);
const uuidSchema = z.string().uuid();
const sessionTokenSchema = z.string().uuid();

const updateSchema = z
  .object({
    service: z.string().max(500).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
    message: z.string().max(1000).optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    name: z.string().max(100).optional(),
    phone: z.string().max(20).optional(),
  })
  .strict();

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

function checkRateLimit(
  ip: string,
  maxRequests: number = 10,
  windowMs: number = 3600000,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) rateLimitMap.delete(key);
    }
  }

  if (!record || record.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) return { allowed: false, remaining: 0 };

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function validateSession(
  supabase: ReturnType<typeof createClient>,
  normalizedEmail: string,
  sessionToken: string,
): Promise<boolean> {
  const tokenHash = await sha256Hex(sessionToken);
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('booking_sessions')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('token_hash', tokenHash)
    .gt('expires_at', nowIso)
    .maybeSingle();

  if (error) {
    console.error('[manage-booking] Session lookup error:', error);
    return false;
  }

  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP, 10, 3600000);

    if (!rateLimit.allowed) {
      console.log(`[manage-booking] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '3600',
        },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();

    const actionResult = actionSchema.safeParse(body.action);
    if (!actionResult.success) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const action = actionResult.data;

    const emailResult = emailSchema.safeParse(body.email);
    if (!emailResult.success) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const normalizedEmail = emailResult.data;

    const sessionTokenResult = sessionTokenSchema.safeParse(body.sessionToken);
    if (!sessionTokenResult.success) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sessionOk = await validateSession(supabase, normalizedEmail, sessionTokenResult.data);
    if (!sessionOk) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[manage-booking] Action: ${action}, IP: ${clientIP}, Rate remaining: ${rateLimit.remaining}`);

    if (action === 'search') {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .ilike('email', normalizedEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[manage-booking] Search error:', error);
        return new Response(JSON.stringify({ error: 'Unable to process request' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ bookings: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update') {
      const bookingIdResult = uuidSchema.safeParse(body.bookingId);
      if (!bookingIdResult.success) {
        return new Response(JSON.stringify({ error: 'Valid booking ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const bookingId = bookingIdResult.data;

      const updatesResult = updateSchema.safeParse(body.updates);
      if (!updatesResult.success) {
        console.log('[manage-booking] Invalid updates object:', updatesResult.error.errors);
        return new Response(JSON.stringify({ error: 'Invalid update data' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const validatedUpdates = updatesResult.data;

      if (Object.keys(validatedUpdates).length === 0) {
        return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('email')
        .eq('id', bookingId)
        .maybeSingle();

      if (fetchError || !booking || booking.email.toLowerCase() !== normalizedEmail) {
        return new Response(JSON.stringify({ error: 'Unable to find or access this booking' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(validatedUpdates)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        console.error('[manage-booking] Update error:', error);
        return new Response(JSON.stringify({ error: 'Unable to process request' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ booking: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete') {
      const bookingIdResult = uuidSchema.safeParse(body.bookingId);
      if (!bookingIdResult.success) {
        return new Response(JSON.stringify({ error: 'Valid booking ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const bookingId = bookingIdResult.data;

      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('email')
        .eq('id', bookingId)
        .maybeSingle();

      if (fetchError || !booking || booking.email.toLowerCase() !== normalizedEmail) {
        return new Response(JSON.stringify({ error: 'Unable to find or access this booking' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

      if (error) {
        console.error('[manage-booking] Delete error:', error);
        return new Response(JSON.stringify({ error: 'Unable to process request' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[manage-booking] Error:', error);
    return new Response(JSON.stringify({ error: 'Unable to process request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
