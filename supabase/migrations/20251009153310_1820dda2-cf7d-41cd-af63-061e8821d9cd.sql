-- Create a function to call the edge function when a booking is created
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  response_status INT;
BEGIN
  -- Call the edge function to send notification
  SELECT status INTO response_status
  FROM http((
    'POST',
    'https://nzvtmmcrfnzztvyihplj.supabase.co/functions/v1/send-booking-notification',
    ARRAY[http_header('Content-Type', 'application/json')],
    'application/json',
    json_build_object(
      'customer_name', NEW.customer_name,
      'customer_email', NEW.customer_email,
      'customer_phone', NEW.customer_phone,
      'service', NEW.service,
      'preferred_date', NEW.preferred_date::text,
      'preferred_time', NEW.preferred_time::text,
      'notes', NEW.notes,
      'status', NEW.status
    )::text
  )::http_request);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on new bookings
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_booking();