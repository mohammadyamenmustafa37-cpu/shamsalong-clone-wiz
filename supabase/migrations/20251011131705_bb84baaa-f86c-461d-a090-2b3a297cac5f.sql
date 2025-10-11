-- Fix the anonymous booking view policy

-- Remove the problematic policy
DROP POLICY IF EXISTS "Users can view bookings by email" ON public.bookings;

-- Anonymous users will use the manage-booking edge function to search by email
-- This is already implemented and secure