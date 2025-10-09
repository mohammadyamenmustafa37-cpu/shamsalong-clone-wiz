import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotification {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingNotification = await req.json();
    console.log("Received booking notification request:", booking);

    // Format the date and time for better readability
    const bookingDate = new Date(booking.preferred_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send email notification to admin
    const emailResponse = await resend.emails.send({
      from: "Sham Salong <onboarding@resend.dev>",
      to: ["admin@shamsalong.com"], // Replace with your actual admin email
      subject: `New Booking: ${booking.customer_name} - ${booking.service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            New Booking Received
          </h1>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #4CAF50; margin-top: 0;">Customer Information</h2>
            <p><strong>Name:</strong> ${booking.customer_name}</p>
            <p><strong>Email:</strong> ${booking.customer_email}</p>
            ${booking.customer_phone ? `<p><strong>Phone:</strong> ${booking.customer_phone}</p>` : ''}
          </div>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #4CAF50; margin-top: 0;">Booking Details</h2>
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${booking.preferred_time}</p>
            <p><strong>Status:</strong> <span style="background-color: #FFA500; color: white; padding: 3px 8px; border-radius: 3px;">${booking.status}</span></p>
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            You can manage this booking in your <a href="https://fd69bbea-2926-4f47-a55c-a234f0c3dfb8.lovableproject.com/admin" style="color: #4CAF50;">admin panel</a>.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
