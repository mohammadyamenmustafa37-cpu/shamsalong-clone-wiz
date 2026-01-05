-- Add explicit deny-all policies to satisfy linter while keeping tables backend-only
DROP POLICY IF EXISTS "No client access" ON public.booking_otp_challenges;
CREATE POLICY "No client access"
ON public.booking_otp_challenges
FOR ALL
TO public
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "No client access" ON public.booking_sessions;
CREATE POLICY "No client access"
ON public.booking_sessions
FOR ALL
TO public
USING (false)
WITH CHECK (false);