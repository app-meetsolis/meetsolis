-- Create the waitlist table
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  name text,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'pending' -- pending, invited, joined
);

-- Enable RLS
alter table public.waitlist enable row level security;

-- Allow public inserts (anyone can join waitlist)
create policy "Allow public inserts"
  on public.waitlist
  for insert
  to public
  with check (true);

-- Only allowing reading by admins/service_role (no public read)
-- (No select policy needed for public, default is deny)
