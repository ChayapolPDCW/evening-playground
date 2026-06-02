create type submission_status_v2 as enum ('pending', 'accepted', 'rejected');

alter table submissions
alter column status drop default;

alter table submissions
alter column status type submission_status_v2
using (
  case status::text
    when 'passed' then 'accepted'
    when 'failed' then 'rejected'
    when 'pending' then 'pending'
    when 'accepted' then 'accepted'
    when 'rejected' then 'rejected'
    else 'pending'
  end
)::submission_status_v2;

drop type submission_status;
alter type submission_status_v2 rename to submission_status;

alter table submissions
add column if not exists reviewed_at timestamptz,
add column if not exists updated_at timestamptz not null default now();
