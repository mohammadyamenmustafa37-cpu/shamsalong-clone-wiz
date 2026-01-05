import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Accept both the newer structured payload and the legacy client payload.
const structuredSchema = z.object({
  customer_name: z.string().min(1).max(100),
  customer_email: z.string().email().max(255),
  customer_phone: z.string().max(20).optional(),
  service: z.string().min(1).max(500),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  preferred_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  notes: z.string().max(1000).optional(),
  status: z.string().max(50),
});

const legacySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  service: z.string().min(1).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  message: z.string().max(1000).optional(),
});

const bookingNotificationSchema = z.union([structuredSchema, legacySchema]).transform((input) => {
  if ('customer_name' in input) {
    return input;
  }

  return {
    customer_name: input.name,
    customer_email: input.email,
    customer_phone: input.phone,
    service: input.service,
    preferred_date: input.date,
    preferred_time: input.time,
    notes: input.message,
    status: 'pending',
  };
});

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

function checkRateLimit(ip: string, maxRequests: number = 5, windowMs: number = 3600000): { allowed: boolean; remaining: number } {
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

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP, 5, 3600000);

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '3600'
        }
      });
    }

    const body = await req.json();

    const parseResult = bookingNotificationSchema.safeParse(body);
    if (!parseResult.success) {
      console.log('[send-booking-notification] Invalid input:', parseResult.error.errors);
      return new Response(JSON.stringify({ error: 'Invalid booking data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const booking = parseResult.data;

    const bookingDate = new Date(booking.preferred_date).toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const safeName = escapeHtml(booking.customer_name);
    const safeEmail = escapeHtml(booking.customer_email);
    const safePhone = booking.customer_phone ? escapeHtml(booking.customer_phone) : null;
    const safeService = escapeHtml(booking.service);
    const safeTime = escapeHtml(booking.preferred_time);
    const safeStatus = escapeHtml(booking.status);
    const safeNotes = booking.notes ? escapeHtml(booking.notes) : null;

    const origin = req.headers.get('origin') || '';
    const adminLink = origin ? `${origin}/admin` : null;

    const emailResponse = await resend.emails.send({
      from: "Sham Salong <onboarding@resend.dev>",
      to: ["admin@shamsalong.com"],
      subject: `New Booking: ${safeName} - ${safeService}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            New Booking Received
          </h1>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #4CAF50; margin-top: 0;">Customer Information</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #4CAF50; margin-top: 0;">Booking Details</h2>
            <p><strong>Service:</strong> ${safeService}</p>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${safeTime}</p>
            <p><strong>Status:</strong> <span style="background-color: #FFA500; color: white; padding: 3px 8px; border-radius: 3px;">${safeStatus}</span></p>
            ${safeNotes ? `<p><strong>Notes:</strong> ${safeNotes}</p>` : ''}
          </div>

          ${adminLink ? `
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Manage this booking in your <a href="${adminLink}" style="color: #4CAF50;">admin panel</a>.
            </p>
          ` : ''}
        </div>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("[send-booking-notification] Error:", error);
    return new Response(JSON.stringify({ error: 'Unable to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
