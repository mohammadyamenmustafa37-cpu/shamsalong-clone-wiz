import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const createBookingSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().email().max(255).transform((v) => v.trim().toLowerCase()),
    phone: z.string().trim().min(3).max(20),
    services: z.array(z.string().trim().min(1).max(120)).min(1).max(10).optional(),
    service: z.string().trim().min(1).max(500).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    message: z.string().trim().max(1000).nullable().optional(),
  })
  .strict()
  .superRefine((val, ctx) => {
    if ((!val.services || val.services.length === 0) && !val.service) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Service is required' });
    }
  });

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP, 10, 3600000); // 10 bookings/hour/IP

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '3600',
        },
      });
    }

    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      console.log('[create-booking] Invalid input:', parsed.error.errors);
      return new Response(JSON.stringify({ error: 'Invalid booking data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const input = parsed.data;
    const serviceString = input.services?.length ? input.services.join(', ') : input.service!;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        name: input.name,
        email: input.email,
        phone: input.phone,
        service: serviceString,
        date: input.date,
        time: input.time,
        message: input.message ?? null,
        status: 'pending',
        payment_method: 'store',
        payment_status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[create-booking] Insert error:', error);
      return new Response(JSON.stringify({ error: 'Unable to create booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[create-booking] Created booking ${data.id} (IP: ${clientIP}, remaining: ${rateLimit.remaining})`);

    return new Response(JSON.stringify({ success: true, bookingId: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[create-booking] Error:', error);
    return new Response(JSON.stringify({ error: 'Unable to process request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
