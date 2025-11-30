-- Create system_settings table
create table if not exists system_settings (
  key text primary key,
  value text
);

-- Enable RLS
alter table system_settings enable row level security;

-- Create policy to allow everyone to read settings (like announcements)
create policy "Allow public read access"
  on system_settings for select
  using (true);

-- Create policy to allow only admins to insert/update/delete
-- Note: This assumes you have a way to check for admin status in RLS, 
-- usually via a custom claim or a profile lookup. 
-- For simplicity in this demo, we might allow authenticated users if we trust the app logic,
-- BUT for security, you should strictly limit this.
-- Here is a policy that allows authenticated users to update (assuming app checks is_admin)
create policy "Allow authenticated update"
  on system_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Insert default values
insert into system_settings (key, value) values
  ('maintenance_mode', 'false'),
  ('announcement', '')
on conflict (key) do nothing;
