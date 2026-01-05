import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Zod schemas
const emailSchema = z.string().email().max(255).transform(val => val.trim().toLowerCase());
const otpSchema = z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits');
const actionSchema = z.enum(['send', 'verify']);

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Store OTPs in memory (in production, use database or Redis)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function checkRateLimit(ip: string, maxRequests: number = 5, windowMs: number = 3600000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
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

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP, 5, 3600000); // 5 OTP requests per hour
    
    if (!rateLimit.allowed) {
      console.log(`[send-otp] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'För många försök. Vänligen försök igen senare.' }),
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

    const body = await req.json();

    // Validate action
    const actionResult = actionSchema.safeParse(body.action);
    if (!actionResult.success) {
      return new Response(
        JSON.stringify({ error: 'Ogiltig åtgärd' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const action = actionResult.data;

    // Validate email
    const emailResult = emailSchema.safeParse(body.email);
    if (!emailResult.success) {
      return new Response(
        JSON.stringify({ error: 'Ogiltig e-postadress' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const normalizedEmail = emailResult.data;

    if (action === 'send') {
      // Check if user has any bookings first
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id')
        .ilike('email', normalizedEmail)
        .limit(1);

      if (error) {
        console.error('[send-otp] Error checking bookings:', error);
        return new Response(
          JSON.stringify({ error: 'Kunde inte behandla förfrågan' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Always return success to prevent email enumeration
      // But only actually send OTP if bookings exist
      if (!bookings || bookings.length === 0) {
        console.log(`[send-otp] No bookings found for email (not revealing to client)`);
        return new Response(
          JSON.stringify({ success: true, message: 'Om det finns bokningar för denna e-post får du en kod.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate and store OTP
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      otpStore.set(normalizedEmail, { otp, expiresAt, attempts: 0 });

      // Clean up expired OTPs
      for (const [email, data] of otpStore.entries()) {
        if (data.expiresAt < Date.now()) {
          otpStore.delete(email);
        }
      }

      // Send OTP via email
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        console.error('[send-otp] RESEND_API_KEY not configured');
        return new Response(
          JSON.stringify({ error: 'E-posttjänsten är inte konfigurerad' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const resend = new Resend(resendApiKey);
      const emailResponse = await resend.emails.send({
        from: 'Sham Salong <onboarding@resend.dev>',
        to: [normalizedEmail],
        subject: 'Din verifieringskod - Sham Salong',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; text-align: center;">Sham Salong</h1>
            <h2 style="color: #666; text-align: center;">Din verifieringskod</h2>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0;">
              <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Använd denna kod för att hantera dina bokningar:</p>
              <p style="font-size: 36px; font-weight: bold; color: #333; letter-spacing: 8px; margin: 20px 0;">${escapeHtml(otp)}</p>
              <p style="font-size: 12px; color: #999;">Koden är giltig i 10 minuter.</p>
            </div>
            <p style="font-size: 12px; color: #999; text-align: center;">
              Om du inte begärde denna kod kan du ignorera detta meddelande.
            </p>
          </div>
        `,
      });

      console.log(`[send-otp] OTP sent to ${normalizedEmail}`, emailResponse);

      return new Response(
        JSON.stringify({ success: true, message: 'Verifieringskod skickad till din e-post.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      // Validate OTP
      const otpResult = otpSchema.safeParse(body.otp);
      if (!otpResult.success) {
        return new Response(
          JSON.stringify({ error: 'Ogiltig verifieringskod' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const providedOtp = otpResult.data;

      const stored = otpStore.get(normalizedEmail);
      
      if (!stored) {
        return new Response(
          JSON.stringify({ error: 'Ingen verifieringskod hittades. Begär en ny kod.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check attempts
      if (stored.attempts >= 5) {
        otpStore.delete(normalizedEmail);
        return new Response(
          JSON.stringify({ error: 'För många felaktiga försök. Begär en ny kod.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check expiration
      if (stored.expiresAt < Date.now()) {
        otpStore.delete(normalizedEmail);
        return new Response(
          JSON.stringify({ error: 'Verifieringskoden har gått ut. Begär en ny kod.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify OTP
      if (stored.otp !== providedOtp) {
        stored.attempts++;
        return new Response(
          JSON.stringify({ error: 'Felaktig verifieringskod. Försök igen.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // OTP is valid - generate a session token
      const sessionToken = crypto.randomUUID();
      const sessionExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

      // Clean up OTP
      otpStore.delete(normalizedEmail);

      // Store session (in memory for now)
      otpStore.set(`session:${sessionToken}`, { 
        otp: normalizedEmail, // Store email in otp field for reuse
        expiresAt: sessionExpiry, 
        attempts: 0 
      });

      console.log(`[send-otp] OTP verified for ${normalizedEmail}`);

      return new Response(
        JSON.stringify({ success: true, sessionToken, message: 'Verifierad!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ogiltig åtgärd' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[send-otp] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Kunde inte behandla förfrågan' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
