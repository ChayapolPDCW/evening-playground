alter table submissions
add column if not exists reviewed_at timestamptz,
add column if not exists updated_at timestamptz not null default now();
