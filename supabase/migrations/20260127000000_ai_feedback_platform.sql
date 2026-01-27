-- AI-Native Feedback Intelligence Platform Schema
-- Run this in your Supabase SQL editor after the base schema

-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Integration sources (OAuth connections)
create table integration_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade not null,
  type text not null check (type in ('slack', 'intercom', 'app_store', 'zendesk', 'email')),
  name text not null, -- e.g., "Slack - #feedback" or "Intercom - Support"
  status text default 'active' check (status in ('active', 'paused', 'error', 'disconnected')),

  -- OAuth credentials (encrypted at rest by Supabase)
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,

  -- Source-specific config
  config jsonb default '{}', -- e.g., { "channel_ids": ["C123"], "keywords": ["feature", "bug"] }

  -- Tracking
  last_sync_at timestamptz,
  last_error text,
  message_count int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index integration_sources_project_id_idx on integration_sources(project_id);
create index integration_sources_type_idx on integration_sources(type);
create index integration_sources_status_idx on integration_sources(status);

-- Enable RLS
alter table integration_sources enable row level security;

-- Only project owners can manage integrations
create policy "Project owners can view their integrations"
  on integration_sources for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Project owners can manage their integrations"
  on integration_sources for all
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Service role can manage all integrations"
  on integration_sources for all
  using (auth.role() = 'service_role');

-- Raw messages (ingested before AI processing)
create table raw_messages (
  id uuid primary key default gen_random_uuid(),
  integration_source_id uuid references integration_sources on delete cascade not null,
  project_id uuid references projects on delete cascade not null,

  -- External identifiers
  external_id text not null, -- Original message ID from source
  external_thread_id text, -- Thread/conversation ID if applicable
  external_user_id text, -- User ID from source
  external_user_name text, -- User name/display name
  external_user_email text, -- User email if available

  -- Content
  content text not null,
  content_html text, -- Rich text version if available

  -- Context
  channel_name text, -- Slack channel, Intercom inbox, etc.
  metadata jsonb default '{}', -- Any additional source-specific data

  -- Processing status
  status text default 'pending' check (status in ('pending', 'processing', 'processed', 'skipped', 'error')),
  processed_at timestamptz,
  error_message text,

  -- Timestamps
  message_timestamp timestamptz not null, -- When the original message was sent
  created_at timestamptz default now()
);

create unique index raw_messages_source_external_idx on raw_messages(integration_source_id, external_id);
create index raw_messages_project_id_idx on raw_messages(project_id);
create index raw_messages_status_idx on raw_messages(status);
create index raw_messages_timestamp_idx on raw_messages(message_timestamp desc);

-- Enable RLS
alter table raw_messages enable row level security;

create policy "Project owners can view raw messages"
  on raw_messages for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Service role can manage raw messages"
  on raw_messages for all
  using (auth.role() = 'service_role');

-- Feedback clusters (semantically similar feedback grouped together)
create table feedback_clusters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade not null,

  -- Cluster info
  title text not null, -- AI-generated representative title
  description text, -- AI-generated summary

  -- Centroid for similarity matching
  centroid_embedding vector(1536), -- Average of member embeddings

  -- Stats
  member_count int default 0,
  total_mentions int default 0, -- Including merged duplicates

  -- Link to roadmap
  linked_item_id uuid references items on delete set null,

  -- Review
  review_status text default 'pending' check (review_status in ('pending', 'reviewed', 'dismissed')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index feedback_clusters_project_id_idx on feedback_clusters(project_id);
create index feedback_clusters_linked_item_idx on feedback_clusters(linked_item_id);
create index feedback_clusters_review_status_idx on feedback_clusters(review_status);

-- Enable RLS
alter table feedback_clusters enable row level security;

create policy "Project owners can view clusters"
  on feedback_clusters for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Project owners can manage clusters"
  on feedback_clusters for all
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Service role can manage all clusters"
  on feedback_clusters for all
  using (auth.role() = 'service_role');

-- Extracted feedback (AI-identified feature requests, bugs, complaints)
create table extracted_feedback (
  id uuid primary key default gen_random_uuid(),
  raw_message_id uuid references raw_messages on delete cascade not null,
  project_id uuid references projects on delete cascade not null,
  cluster_id uuid references feedback_clusters on delete set null,

  -- Extracted content
  type text not null check (type in ('feature_request', 'bug_report', 'complaint', 'praise', 'question')),
  title text not null, -- Concise actionable summary
  description text, -- Detailed context
  quote text, -- Verbatim customer text

  -- AI analysis
  confidence float not null check (confidence >= 0 and confidence <= 1),
  sentiment text check (sentiment in ('positive', 'negative', 'neutral', 'mixed')),
  urgency text default 'normal' check (urgency in ('low', 'normal', 'high', 'critical')),

  -- Embedding for semantic search
  embedding vector(1536),

  -- Customer info (from raw message)
  customer_name text,
  customer_email text,

  -- Review workflow
  review_status text default 'pending' check (review_status in ('pending', 'approved', 'rejected', 'merged')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users,

  -- If approved, link to created item
  created_item_id uuid references items on delete set null,
  -- If merged, link to existing item
  merged_into_item_id uuid references items on delete set null,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index extracted_feedback_project_id_idx on extracted_feedback(project_id);
create index extracted_feedback_raw_message_idx on extracted_feedback(raw_message_id);
create index extracted_feedback_cluster_idx on extracted_feedback(cluster_id);
create index extracted_feedback_review_status_idx on extracted_feedback(review_status);
create index extracted_feedback_type_idx on extracted_feedback(type);
create index extracted_feedback_confidence_idx on extracted_feedback(confidence);

-- Enable RLS
alter table extracted_feedback enable row level security;

create policy "Project owners can view extracted feedback"
  on extracted_feedback for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Project owners can manage extracted feedback"
  on extracted_feedback for all
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Service role can manage all extracted feedback"
  on extracted_feedback for all
  using (auth.role() = 'service_role');

-- Background jobs tracking
create table background_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade,

  -- Job info
  type text not null, -- e.g., 'process_messages', 'sync_slack', 'cluster_feedback'
  status text default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),

  -- Execution details
  input jsonb default '{}', -- Job input parameters
  output jsonb default '{}', -- Job results
  error_message text,

  -- Timing
  started_at timestamptz,
  completed_at timestamptz,

  -- External job reference (e.g., Inngest run ID)
  external_job_id text,

  created_at timestamptz default now()
);

create index background_jobs_project_id_idx on background_jobs(project_id);
create index background_jobs_type_idx on background_jobs(type);
create index background_jobs_status_idx on background_jobs(status);
create index background_jobs_created_at_idx on background_jobs(created_at desc);

-- Enable RLS
alter table background_jobs enable row level security;

create policy "Project owners can view their jobs"
  on background_jobs for select
  using (
    project_id is null or exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Service role can manage all jobs"
  on background_jobs for all
  using (auth.role() = 'service_role');

-- AI processing logs (cost/usage tracking)
create table ai_processing_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade not null,

  -- What was processed
  operation text not null, -- e.g., 'extract_feedback', 'generate_embedding', 'cluster_analysis'
  model text not null, -- e.g., 'claude-sonnet-4-20250514', 'text-embedding-3-small'

  -- Resource usage
  input_tokens int default 0,
  output_tokens int default 0,

  -- Cost tracking (in cents)
  cost_cents float default 0,

  -- Reference to processed item
  raw_message_id uuid references raw_messages on delete set null,
  extracted_feedback_id uuid references extracted_feedback on delete set null,

  -- Result
  success boolean default true,
  error_message text,
  latency_ms int,

  created_at timestamptz default now()
);

create index ai_processing_logs_project_id_idx on ai_processing_logs(project_id);
create index ai_processing_logs_operation_idx on ai_processing_logs(operation);
create index ai_processing_logs_created_at_idx on ai_processing_logs(created_at desc);

-- Enable RLS
alter table ai_processing_logs enable row level security;

create policy "Project owners can view their AI logs"
  on ai_processing_logs for select
  using (
    exists (
      select 1 from projects
      where projects.id = project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Service role can manage AI logs"
  on ai_processing_logs for all
  using (auth.role() = 'service_role');

-- Function to find similar feedback using vector similarity
create or replace function find_similar_feedback(
  p_embedding vector(1536),
  p_project_id uuid,
  p_threshold float default 0.85,
  p_limit int default 10
)
returns table (
  feedback_id uuid,
  similarity float
) as $$
begin
  return query
  select
    ef.id as feedback_id,
    1 - (ef.embedding <=> p_embedding) as similarity
  from extracted_feedback ef
  where ef.project_id = p_project_id
    and ef.embedding is not null
    and 1 - (ef.embedding <=> p_embedding) >= p_threshold
  order by ef.embedding <=> p_embedding
  limit p_limit;
end;
$$ language plpgsql security definer;

-- Function to find similar clusters
create or replace function find_similar_clusters(
  p_embedding vector(1536),
  p_project_id uuid,
  p_threshold float default 0.85,
  p_limit int default 5
)
returns table (
  cluster_id uuid,
  similarity float
) as $$
begin
  return query
  select
    fc.id as cluster_id,
    1 - (fc.centroid_embedding <=> p_embedding) as similarity
  from feedback_clusters fc
  where fc.project_id = p_project_id
    and fc.centroid_embedding is not null
    and 1 - (fc.centroid_embedding <=> p_embedding) >= p_threshold
  order by fc.centroid_embedding <=> p_embedding
  limit p_limit;
end;
$$ language plpgsql security definer;

-- Trigger to update cluster member count
create or replace function update_cluster_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' and NEW.cluster_id is not null then
    update feedback_clusters
    set member_count = member_count + 1,
        updated_at = now()
    where id = NEW.cluster_id;
  elsif TG_OP = 'UPDATE' then
    if OLD.cluster_id is distinct from NEW.cluster_id then
      if OLD.cluster_id is not null then
        update feedback_clusters
        set member_count = member_count - 1,
            updated_at = now()
        where id = OLD.cluster_id;
      end if;
      if NEW.cluster_id is not null then
        update feedback_clusters
        set member_count = member_count + 1,
            updated_at = now()
        where id = NEW.cluster_id;
      end if;
    end if;
  elsif TG_OP = 'DELETE' and OLD.cluster_id is not null then
    update feedback_clusters
    set member_count = member_count - 1,
        updated_at = now()
    where id = OLD.cluster_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger on_extracted_feedback_cluster_change
  after insert or update or delete on extracted_feedback
  for each row execute function update_cluster_member_count();

-- Trigger to update integration message count
create or replace function update_integration_message_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update integration_sources
    set message_count = message_count + 1,
        updated_at = now()
    where id = NEW.integration_source_id;
  elsif TG_OP = 'DELETE' then
    update integration_sources
    set message_count = message_count - 1,
        updated_at = now()
    where id = OLD.integration_source_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger on_raw_message_change
  after insert or delete on raw_messages
  for each row execute function update_integration_message_count();

-- Add source_type column to items for tracking origin
alter table items add column if not exists source_type text default 'manual'
  check (source_type in ('manual', 'public_submission', 'ai_extracted'));
alter table items add column if not exists source_feedback_id uuid references extracted_feedback on delete set null;

create index if not exists items_source_type_idx on items(source_type);
create index if not exists items_source_feedback_idx on items(source_feedback_id);

-- Create view for feedback inbox (pending review items)
create or replace view feedback_inbox as
select
  ef.*,
  rm.content as raw_content,
  rm.channel_name,
  rm.message_timestamp,
  rm.external_user_name,
  rm.external_user_email,
  is_src.type as source_type,
  is_src.name as source_name,
  fc.title as cluster_title,
  fc.member_count as cluster_size
from extracted_feedback ef
join raw_messages rm on ef.raw_message_id = rm.id
join integration_sources is_src on rm.integration_source_id = is_src.id
left join feedback_clusters fc on ef.cluster_id = fc.id
where ef.review_status = 'pending'
order by ef.confidence desc, ef.created_at desc;

-- Grant access to the view
grant select on feedback_inbox to authenticated;
