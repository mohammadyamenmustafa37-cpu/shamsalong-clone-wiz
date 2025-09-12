-- Add DELETE policy for bookings so customers can cancel
CREATE POLICY "Anyone can cancel bookings" 
ON public.bookings 
FOR DELETE 
USING (true);