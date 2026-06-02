# Evening Playground

A small private Python practice platform built with Next.js, Node.js route handlers, and Supabase.

## Features

- Student dashboard with assigned Python problems.
- Admin dashboard for problems and submission review.
- Problem builder with prompt, image URL, difficulty 1-10, starter code, visible tests, and hidden tests.
- In-browser Python editor using CodeMirror.
- Python runner API with per-test timeout and visible/hidden result handling.
- Submission status flow: `pending`, `accepted`, and `rejected`.
- Submission notifications, admin review controls, and feedback thread.
- Clean responsive UI with dark mode and light mode.

## How Test Cases Work

When an admin creates a problem, they also create test cases. Each test case stores:

- `input`: stdin sent to the Python program.
- `expected_output`: output compared against stdout after trimming trailing whitespace.
- `is_hidden`: whether the student can see the input/expected output.

The `/api/run-python` route writes the submitted code to a temporary file, runs it once per test case, compares output, and returns pass/fail results for the student to inspect. When the student submits, the submission is saved as `pending` so the admin can review the code and mark it `accepted` or `rejected`. For production, run Python inside an isolated container or sandbox service, not directly on the web server.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill Supabase values.

3. Run `supabase/schema.sql` in the Supabase SQL editor.

If you already created the older schema that used `passed` and `failed` submission statuses, also run `supabase/status-migration.sql` once.

4. Create the first admin user in Supabase Auth:

- Supabase Dashboard > Authentication > Users > Add user
- Enter an internal email and password
- Recommended internal email for username `admin`: `admin@evening-playground.local`
- Copy the new user id

Then add a matching row in `profiles`:

```sql
insert into profiles (id, full_name, role)
values ('auth-user-id', 'Teacher', 'admin');
```

After the first admin can log in, use `Admin Console > Create Student` to create student accounts from inside the app. The form asks for username and password only. Internally, the app converts username to a private Supabase Auth email such as `student1@evening-playground.local`, then creates the `profiles` row with role `student`.

To create two students manually instead, repeat Supabase Dashboard > Authentication > Users > Add user twice, then run:

```sql
insert into profiles (id, full_name, role)
values
  ('student-auth-user-id-1', 'Student One', 'student'),
  ('student-auth-user-id-2', 'Student Two', 'student');
```

5. Start the app:

```bash
npm run dev
```

## Notes

This scaffold is designed for a small trusted classroom. The Python runner includes a 2-second timeout, but a serious production version should execute untrusted code in containers, a queue worker, or a dedicated judge service with CPU, memory, network, and filesystem isolation.
