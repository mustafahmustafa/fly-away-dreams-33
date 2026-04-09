
-- Add email format validation and uniqueness to subscribers
ALTER TABLE public.subscribers
  ADD CONSTRAINT chk_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.subscribers
  ADD CONSTRAINT subscribers_email_unique UNIQUE (email);

-- Also add a length constraint to prevent abuse
ALTER TABLE public.subscribers
  ADD CONSTRAINT chk_email_length CHECK (length(email) <= 255);
