-- Drop the trigger and function that require pg_net extension
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
DROP FUNCTION IF EXISTS public.notify_new_booking();

-- We'll call the notification edge function directly from the client code instead