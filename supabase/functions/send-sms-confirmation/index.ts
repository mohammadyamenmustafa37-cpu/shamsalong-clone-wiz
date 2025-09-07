import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSData {
  phone_number: string;
  customer_name: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone_number, customer_name, service, appointment_date, appointment_time }: SMSData = await req.json();

    // Get Twilio credentials from environment variables
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    // Format the date and time for Swedish display
    const formattedDate = new Date(appointment_date).toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create Swedish confirmation message
    const message = `Hej ${customer_name}! 

Din bokning hos Sham Salong är bekräftad:

📅 Datum: ${formattedDate}
🕐 Tid: ${appointment_time}
✂️ Tjänst: ${service}

📍 Adress: Esplanaden 1B, Oxelösund
📞 Telefon: 0793488688

Vi ser fram emot ditt besök!

Mvh,
Sham Salong`;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', phone_number);
    formData.append('Body', message);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twilio API error: ${errorData.message}`);
    }

    const responseData = await response.json();
    console.log('SMS sent successfully:', responseData.sid);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_sid: responseData.sid,
        message: 'SMS-bekräftelse skickad'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Kunde inte skicka SMS-bekräftelse' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});