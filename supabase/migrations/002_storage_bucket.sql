-- Create Supabase Storage bucket for exercise audio
-- Run this in Supabase SQL Editor if the bucket doesn't exist

-- Create the bucket
insert into storage.buckets (id, name, public)
values ('exercises', 'exercises', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload audio files
create policy "Allow authenticated uploads to exercises bucket"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'exercises'
);

-- Allow public read access (audio files are public)
create policy "Allow public read access to exercises bucket"
on storage.objects for select
to public
using (
  bucket_id = 'exercises'
);
