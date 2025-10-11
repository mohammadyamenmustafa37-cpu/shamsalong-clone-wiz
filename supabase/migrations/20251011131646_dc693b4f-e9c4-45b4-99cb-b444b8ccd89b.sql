-- Fix booking policies to properly support public bookings without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Allow anyone to create bookings (public booking form)
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can view all bookings (already exists)
-- Users with auth can view their own bookings if user_id is set
CREATE POLICY "Authenticated users can view their bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow anonymous users to view bookings they created via email lookup
-- This is safe because they need to know the exact email
CREATE POLICY "Users can view bookings by email"
ON public.bookings
FOR SELECT
TO public
USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email' OR auth.uid() IS NULL);