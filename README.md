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

## Notes

This scaffold is designed for a small trusted classroom. The Python runner includes a 2-second timeout, but a serious production version should execute untrusted code in containers, a queue worker, or a dedicated judge service with CPU, memory, network, and filesystem isolation.
