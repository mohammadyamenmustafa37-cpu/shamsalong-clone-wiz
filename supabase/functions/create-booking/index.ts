import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingData {
  customer_name: string;
  phone_number: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { customer_name, phone_number, service, appointment_date, appointment_time }: BookingData = await req.json();

    // Check for conflicting appointments
    const { data: existingBookings, error: checkError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .eq('status', 'confirmed');

    if (checkError) {
      throw new Error(`Database check error: ${checkError.message}`);
    }

    if (existingBookings && existingBookings.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Tiden är redan bokad. Välj en annan tid.' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create the booking
    const { data: booking, error: insertError } = await supabaseClient
      .from('bookings')
      .insert({
        customer_name,
        phone_number,
        service,
        appointment_date,
        appointment_time,
        status: 'confirmed'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Insert error: ${insertError.message}`);
    }

    // Send SMS confirmation
    try {
      const smsResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-sms-confirmation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number,
          customer_name,
          service,
          appointment_date,
          appointment_time,
        }),
      });

      if (!smsResponse.ok) {
        console.error('SMS sending failed, but booking was created successfully');
      }
    } catch (smsError) {
      console.error('SMS error:', smsError);
      // Don't fail the booking if SMS fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        booking,
        message: 'Bokning skapad! Du kommer att få en bekräftelse via SMS.'
      }),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating booking:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Ett fel uppstod vid bokning' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});