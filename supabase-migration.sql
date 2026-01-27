-- Migration script for existing shipped.fyi databases
-- Run this in your Supabase SQL editor if you already have the base schema

-- 1. Add category_id to items table
alter table items add column if not exists category_id uuid references categories on delete set null;
create index if not exists items_category_id_idx on items(category_id);

-- 2. Add notify_on_ship to votes table
alter table votes add column if not exists notify_on_ship boolean default false;

-- 3. Create categories table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade not null,
  name text not null,
  color text default 'gray' check (color in ('gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose')),
  created_at timestamptz default now()
);

create index if not exists categories_project_id_idx on categories(project_id);
alter table categories enable row level security;

-- Categories RLS policies
drop policy if exists "Categories are viewable by everyone" on categories;
create policy "Categories are viewable by everyone"
  on categories for select using (true);

drop policy if exists "Project owners can insert categories" on categories;
create policy "Project owners can insert categories"
  on categories for insert
  with check (
    exists (select 1 from projects where projects.id = project_id and projects.owner_id = auth.uid())
  );

drop policy if exists "Project owners can update categories" on categories;
create policy "Project owners can update categories"
  on categories for update
  using (
    exists (select 1 from projects where projects.id = project_id and projects.owner_id = auth.uid())
  );

drop policy if exists "Project owners can delete categories" on categories;
create policy "Project owners can delete categories"
  on categories for delete
  using (
    exists (select 1 from projects where projects.id = project_id and projects.owner_id = auth.uid())
  );

-- 4. Create notification_logs table
create table if not exists notification_logs (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items on delete cascade not null,
  voter_email text not null,
  sent_at timestamptz default now(),
  unique(item_id, voter_email)
);

create index if not exists notification_logs_item_id_idx on notification_logs(item_id);
alter table notification_logs enable row level security;

drop policy if exists "Service role can manage notification logs" on notification_logs;
create policy "Service role can manage notification logs"
  on notification_logs for all using (auth.role() = 'service_role');

-- 5. Create unsubscribe_tokens table
create table if not exists unsubscribe_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text unique not null default gen_random_uuid()::text,
  created_at timestamptz default now()
);

create index if not exists unsubscribe_tokens_email_idx on unsubscribe_tokens(email);
create index if not exists unsubscribe_tokens_token_idx on unsubscribe_tokens(token);
alter table unsubscribe_tokens enable row level security;

drop policy if exists "Service role can manage unsubscribe tokens" on unsubscribe_tokens;
create policy "Service role can manage unsubscribe tokens"
  on unsubscribe_tokens for all using (auth.role() = 'service_role');

-- 6. Create rate_limits table
create table if not exists rate_limits (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  endpoint text not null,
  window_start timestamptz not null default now(),
  request_count int default 1,
  unique(identifier, endpoint, window_start)
);

create index if not exists rate_limits_identifier_idx on rate_limits(identifier, endpoint);
create index if not exists rate_limits_window_idx on rate_limits(window_start);
alter table rate_limits enable row level security;

drop policy if exists "Service role can manage rate limits" on rate_limits;
create policy "Service role can manage rate limits"
  on rate_limits for all using (auth.role() = 'service_role');

-- 7. Rate limit function
create or replace function check_rate_limit(
  p_identifier text,
  p_endpoint text,
  p_max_requests int,
  p_window_seconds int
)
returns boolean as $$
declare
  v_window_start timestamptz;
  v_count int;
begin
  v_window_start := date_trunc('minute', now()) - ((extract(minute from now())::int % (p_window_seconds / 60)) || ' minutes')::interval;

  insert into rate_limits (identifier, endpoint, window_start, request_count)
  values (p_identifier, p_endpoint, v_window_start, 1)
  on conflict (identifier, endpoint, window_start)
  do update set request_count = rate_limits.request_count + 1
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$ language plpgsql security definer;

-- 8. Cleanup function for rate limits
create or replace function cleanup_rate_limits()
returns void as $$
begin
  delete from rate_limits where window_start < now() - interval '1 hour';
end;
$$ language plpgsql security definer;

-- Done! Your database is now up to date.
