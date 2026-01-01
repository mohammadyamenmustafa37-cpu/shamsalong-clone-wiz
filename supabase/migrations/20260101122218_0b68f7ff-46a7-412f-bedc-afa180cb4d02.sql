-- Add payment tracking columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN payment_method text DEFAULT 'pay_later',
ADD COLUMN payment_status text DEFAULT 'pending';

-- Add check constraint for valid payment methods
ALTER TABLE public.bookings 
ADD CONSTRAINT valid_payment_method CHECK (payment_method IN ('pay_later', 'swish'));

-- Add check constraint for valid payment statuses  
ALTER TABLE public.bookings
ADD CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'not_required'));