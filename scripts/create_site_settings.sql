-- Create the site settings table used by the admin Settings page.
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

-- Seed a default row so the frontend can load settings immediately.
INSERT INTO public.site_settings (id, settings, updated_at)
VALUES (
  1,
  '{
    "company_name": "PMTC Trading Company",
    "company_logo_url": "",
    "company_description": "Authorised dealer of premium industrial tools and machinery. Serving contractors, factories, and professionals across India since 2017.",
    "founded_year": 2017,
    "company_address": "D. No 8-24-19/1, Miriyala Vaari Street, Near Ratna Palace, Main Road, Rajamahendravaram - 533101",
    "phone_number": "6281778963",
    "whatsapp_number": "6281778963",
    "email_address": "pmtcpowertools@gmail.com",
    "website_url": "",
    "gst_number": "36AABCP1234M1Z5",
    "business_hours": "Mon–Sat, 9AM–6PM",
    "google_maps_link": "https://www.google.com/maps/search/D.+No+8-24-19%2F1,+Miriyala+Vaari+Street,+Near+Ratna+Palace,+Main+Road,+Rajamahendravaram+-+533101",
    "facebook_url": "",
    "instagram_url": "",
    "linkedin_url": "",
    "youtube_url": ""
  }'::jsonb,
  now()
)
ON CONFLICT (id) DO UPDATE
SET settings = EXCLUDED.settings,
    updated_at = EXCLUDED.updated_at;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated admins to insert site settings" ON public.site_settings;
CREATE POLICY "Allow authenticated admins to insert site settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (exists (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  ));

DROP POLICY IF EXISTS "Allow authenticated admins to update site settings" ON public.site_settings;
CREATE POLICY "Allow authenticated admins to update site settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (exists (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  ))
  WITH CHECK (exists (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  ));

