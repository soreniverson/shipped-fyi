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
