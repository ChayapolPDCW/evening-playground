create type app_role as enum ('admin', 'student');
create type submission_status as enum ('pending', 'accepted', 'rejected');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role app_role not null default 'student',
  created_at timestamptz not null default now()
);

create table problems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  prompt text not null,
  image_url text,
  difficulty int not null check (difficulty between 1 and 10),
  starter_code text not null default '',
  published boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table test_cases (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references problems(id) on delete cascade,
  name text not null,
  input text not null default '',
  expected_output text not null default '',
  is_hidden boolean not null default false,
  order_index int not null default 1
);

create table problem_assignments (
  problem_id uuid not null references problems(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (problem_id, student_id)
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references problems(id) on delete cascade,
  student_id uuid references profiles(id) on delete set null,
  code text not null,
  note text not null default '',
  status submission_status not null,
  passed_count int not null default 0,
  total_count int not null default 0,
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table feedback_messages (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  author_role app_role not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  user_role app_role,
  title text not null,
  body text not null default '',
  submission_id uuid references submissions(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table problems enable row level security;
alter table test_cases enable row level security;
alter table problem_assignments enable row level security;
alter table submissions enable row level security;
alter table feedback_messages enable row level security;
alter table notifications enable row level security;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create policy "read own profile or admin" on profiles for select using (id = auth.uid() or is_admin());
create policy "admins manage profiles" on profiles for all using (is_admin()) with check (is_admin());

create policy "students read assigned published problems" on problems for select using (
  published and exists (
    select 1 from problem_assignments
    where problem_assignments.problem_id = problems.id
    and problem_assignments.student_id = auth.uid()
  )
);
create policy "admins manage problems" on problems for all using (is_admin()) with check (is_admin());

create policy "students read visible assigned tests" on test_cases for select using (
  not is_hidden and exists (
    select 1 from problem_assignments
    where problem_assignments.problem_id = test_cases.problem_id
    and problem_assignments.student_id = auth.uid()
  )
);
create policy "admins manage tests" on test_cases for all using (is_admin()) with check (is_admin());

create policy "students read own assignments" on problem_assignments for select using (student_id = auth.uid());
create policy "admins manage assignments" on problem_assignments for all using (is_admin()) with check (is_admin());

create policy "students read own submissions" on submissions for select using (student_id = auth.uid());
create policy "students create own submissions" on submissions for insert with check (student_id = auth.uid());
create policy "admins read submissions" on submissions for select using (is_admin());

create policy "thread participants read feedback" on feedback_messages for select using (
  is_admin() or exists (
    select 1 from submissions where submissions.id = feedback_messages.submission_id and submissions.student_id = auth.uid()
  )
);
create policy "admins create feedback" on feedback_messages for insert with check (is_admin());

create policy "read own notifications or role notifications" on notifications for select using (
  user_id = auth.uid() or (user_role = 'admin' and is_admin()) or user_role = 'student'
);
create policy "admins manage notifications" on notifications for all using (is_admin()) with check (is_admin());
