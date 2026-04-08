-- ============================================================
-- SOAR Test Seed: Mock project you can apply to
-- Run this in the Supabase SQL Editor (runs as superuser)
-- ============================================================

-- 1. Create a fake "poster" user in auth.users
--    (needed because projects.user_id has a FK to auth.users)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  aud,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'test-poster@soar.local',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Organization Admin"}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 2. Create an organization for the test poster
INSERT INTO public.organizations (user_id, company_name, website, description, industry, type)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Acme Sustainability Corp',
  'https://acme.example.com',
  'A fictional organization focused on sustainable technology solutions.',
  'Technology',
  'non-profit'
) ON CONFLICT (user_id) DO NOTHING;

-- 3. Create a user_profile for the test poster
INSERT INTO public.user_profiles (user_id, role, full_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'poster',
  'Test Organization Admin'
) ON CONFLICT (user_id) DO NOTHING;

-- 4. Create a published, public project owned by the test poster
INSERT INTO public.projects (
  id,
  user_id,
  title,
  description,
  banner_type,
  banner_value,
  start_date,
  end_date,
  duration,
  time_commitment,
  compensation_type,
  compensation_amount,
  location_type,
  location_detail,
  skills,
  capacity,
  require_approval,
  visibility,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000099',
  '00000000-0000-0000-0000-000000000001',
  'Community Solar Dashboard',
  'Build a real-time dashboard tracking solar panel output for community-owned installations across three neighborhoods. The project involves data visualization, API integration with IoT sensors, and a public-facing metrics page.

We need help with frontend development (React/Next.js), data pipeline design, and UX research for the community stakeholder view.',
  'color',
  '#2D4A3E',
  '2026-05-01',
  '2026-08-31',
  '4 months',
  '10-15 hrs/week',
  'paid',
  '$2,500 stipend',
  'remote',
  '{}',
  ARRAY['React', 'Next.js', 'TypeScript', 'Data Visualization', 'REST APIs'],
  '3',
  false,
  'public',
  'published'
) ON CONFLICT (id) DO NOTHING;

-- 5. Make YOUR account role = 'both' so you can apply
--    ⚠️  Replace the email below with your actual login email
DO $$
DECLARE
  my_uid uuid;
BEGIN
  SELECT id INTO my_uid FROM auth.users
    WHERE email = 'vassiligb12@gmail.com'   -- <── change this
    LIMIT 1;

  IF my_uid IS NOT NULL THEN
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (my_uid, 'both')
    ON CONFLICT (user_id)
    DO UPDATE SET role = 'both', updated_at = now();

    RAISE NOTICE 'Updated user % to role=both', my_uid;
  ELSE
    RAISE WARNING 'No user found with that email — update the email in this script';
  END IF;
END $$;
