-- Shipped.fyi Database Schema
-- Run this in your Supabase SQL editor

-- Projects (boards)
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  owner_id uuid references auth.users not null,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

-- Feedback items
create table items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade not null,
  title text not null,
  description text,
  status text default 'considering' check (status in ('considering', 'planned', 'in_progress', 'shipped')),
  vote_count int default 0,
  shipped_at timestamptz,
  created_at timestamptz default now()
);

-- Votes (one per email per item, or one per anonymous token per item)
create table votes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items on delete cascade not null,
  voter_email text,
  voter_token text,
  created_at timestamptz default now(),
  unique(item_id, voter_email),
  unique(item_id, voter_token)
);

-- Create indexes for better performance
create index items_project_id_idx on items(project_id);
create index items_status_idx on items(status);
create index votes_item_id_idx on votes(item_id);
create index projects_owner_id_idx on projects(owner_id);
create index projects_slug_idx on projects(slug);

-- RLS Policies

-- Enable RLS
alter table projects enable row level security;
alter table items enable row level security;
alter table votes enable row level security;

-- Projects: anyone can read, only owner can write
create policy "Projects are viewable by everyone"
  on projects for select
  using (true);

create policy "Users can insert their own projects"
  on projects for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = owner_id);

-- Items: anyone can read, only project owner can write
create policy "Items are viewable by everyone"
  on items for select
  using (true);

create policy "Project owners can insert items"
  on items for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Anyone can insert ideas (public submissions)"
  on items for insert
  with check (status = 'considering');

create policy "Project owners can update items"
  on items for update
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Project owners can delete items"
  on items for delete
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

-- Votes: anyone can read and insert, no update/delete
create policy "Votes are viewable by everyone"
  on votes for select
  using (true);

create policy "Anyone can vote"
  on votes for insert
  with check (true);

-- Function to increment vote count
create or replace function increment_vote_count()
returns trigger as $$
begin
  update items set vote_count = vote_count + 1 where id = NEW.item_id;
  return NEW;
end;
$$ language plpgsql security definer;

-- Function to decrement vote count
create or replace function decrement_vote_count()
returns trigger as $$
begin
  update items set vote_count = vote_count - 1 where id = OLD.item_id;
  return OLD;
end;
$$ language plpgsql security definer;

-- Triggers for vote count
create trigger on_vote_insert
  after insert on votes
  for each row execute function increment_vote_count();

create trigger on_vote_delete
  after delete on votes
  for each row execute function decrement_vote_count();

-- Function to auto-set shipped_at when status changes to 'shipped'
create or replace function set_shipped_at()
returns trigger as $$
begin
  if NEW.status = 'shipped' and (OLD.status is null or OLD.status != 'shipped') then
    NEW.shipped_at = now();
  elsif NEW.status != 'shipped' then
    NEW.shipped_at = null;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger on_item_status_change
  before update on items
  for each row execute function set_shipped_at();

-- Categories for organizing feedback items
create table categories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade not null,
  name text not null,
  color text default 'gray' check (color in ('gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose')),
  created_at timestamptz default now()
);

create index categories_project_id_idx on categories(project_id);

-- Enable RLS on categories
alter table categories enable row level security;

-- Categories: anyone can read, only project owner can write
create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

create policy "Project owners can insert categories"
  on categories for insert
  with check (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Project owners can update categories"
  on categories for update
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Project owners can delete categories"
  on categories for delete
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

-- Add category_id to items table (run as ALTER if table exists)
-- alter table items add column category_id uuid references categories on delete set null;
-- create index items_category_id_idx on items(category_id);

-- Notification logs to track sent emails and prevent duplicates
create table notification_logs (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references items on delete cascade not null,
  voter_email text not null,
  sent_at timestamptz default now(),
  unique(item_id, voter_email)
);

create index notification_logs_item_id_idx on notification_logs(item_id);

-- Enable RLS on notification_logs
alter table notification_logs enable row level security;

-- Only service role can access notification logs
create policy "Service role can manage notification logs"
  on notification_logs for all
  using (auth.role() = 'service_role');

-- Add notify_on_ship column to votes (run as ALTER if table exists)
-- alter table votes add column notify_on_ship boolean default false;

-- Unsubscribe tokens for email preferences
create table unsubscribe_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text unique not null default gen_random_uuid()::text,
  created_at timestamptz default now()
);

create index unsubscribe_tokens_email_idx on unsubscribe_tokens(email);
create index unsubscribe_tokens_token_idx on unsubscribe_tokens(token);

-- Enable RLS
alter table unsubscribe_tokens enable row level security;

-- Only service role can manage unsubscribe tokens
create policy "Service role can manage unsubscribe tokens"
  on unsubscribe_tokens for all
  using (auth.role() = 'service_role');

-- Rate limiting table for tracking request counts
create table rate_limits (
  id uuid primary key default gen_random_uuid(),
  identifier text not null, -- IP address or user ID
  endpoint text not null, -- e.g., 'submit_idea', 'vote'
  window_start timestamptz not null default now(),
  request_count int default 1,
  unique(identifier, endpoint, window_start)
);

create index rate_limits_identifier_idx on rate_limits(identifier, endpoint);
create index rate_limits_window_idx on rate_limits(window_start);

-- Enable RLS
alter table rate_limits enable row level security;

-- Only service role can manage rate limits
create policy "Service role can manage rate limits"
  on rate_limits for all
  using (auth.role() = 'service_role');

-- Function to check and update rate limit
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

  -- Try to increment existing record or insert new one
  insert into rate_limits (identifier, endpoint, window_start, request_count)
  values (p_identifier, p_endpoint, v_window_start, 1)
  on conflict (identifier, endpoint, window_start)
  do update set request_count = rate_limits.request_count + 1
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$ language plpgsql security definer;

-- Clean up old rate limit records (run periodically)
create or replace function cleanup_rate_limits()
returns void as $$
begin
  delete from rate_limits where window_start < now() - interval '1 hour';
end;
$$ language plpgsql security definer;

-- Subscriptions (Stripe integration)
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text default 'free' check (plan in ('free', 'pro')),
  status text default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index subscriptions_user_id_idx on subscriptions(user_id);
create index subscriptions_stripe_customer_id_idx on subscriptions(stripe_customer_id);

-- Enable RLS on subscriptions
alter table subscriptions enable row level security;

-- Users can only read their own subscription
create policy "Users can view their own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Only service role can insert/update (via webhooks)
create policy "Service role can manage subscriptions"
  on subscriptions for all
  using (auth.role() = 'service_role');
