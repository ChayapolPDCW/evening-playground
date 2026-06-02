import Link from "next/link";
import { Bell, FilePlus2, Inbox, ListChecks, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { submissionStatusBadgeClass, submissionStatusLabel } from "@/lib/badges";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/supabase/shape";

export default async function AdminPage() {
  const { profile } = await requireRole("admin");
  const supabase = await createClient();

  const [{ count: problemCount }, { count: submissionCount }, { count: studentCount }, { data: submissions }] =
    await Promise.all([
      supabase.from("problems").select("*", { count: "exact", head: true }),
      supabase.from("submissions").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase
        .from("submissions")
        .select("id, status, passed_count, total_count, created_at, problems(title), profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  return (
    <AppShell role="Admin" title="Admin Console" userName={profile.full_name}>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Metric icon={<FilePlus2 size={18} />} label="Problems" value={problemCount ?? 0} />
        <Metric icon={<Inbox size={18} />} label="Submissions" value={submissionCount ?? 0} />
        <Metric icon={<Users size={18} />} label="Students" value={studentCount ?? 0} />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-ink" href="/admin/problems/new">
          <FilePlus2 size={17} /> New Problem
        </Link>
        <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-black/10 px-4 text-sm font-semibold dark:border-white/10" href="/admin/problems">
          <ListChecks size={17} /> Problems
        </Link>
        <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-black/10 px-4 text-sm font-semibold dark:border-white/10" href="/admin/students">
          <Users size={17} /> Students
        </Link>
        <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-black/10 px-4 text-sm font-semibold dark:border-white/10" href="/admin/submissions">
          <Bell size={17} /> Review Submissions
        </Link>
        <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-black/10 px-4 text-sm font-semibold dark:border-white/10" href="/admin/students/new">
          <UserPlus size={17} /> Create Student
        </Link>
      </div>

      <section className="rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
          <h2 className="font-semibold">Recent Submissions</h2>
        </div>
        <div className="divide-y divide-black/10 dark:divide-white/10">
          {submissions?.map((submission) => (
            <Link className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.05]" href={`/admin/submissions/${submission.id}`} key={submission.id}>
              <div>
                <p className="font-medium">{one(submission.problems)?.title ?? "Untitled problem"}</p>
                <p className="text-sm text-black/55 dark:text-white/55">{one(submission.profiles)?.full_name ?? "Student"}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={submission.status} />
                <span className="rounded-md bg-black/[0.04] px-2.5 py-1 text-sm font-semibold dark:bg-white/[0.08]">
                  {submission.passed_count}/{submission.total_count}
                </span>
              </div>
            </Link>
          ))}
          {!submissions?.length && <p className="px-5 py-8 text-sm text-black/55 dark:text-white/55">No submissions yet.</p>}
        </div>
      </section>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = submissionStatusLabel(status);
  const className = submissionStatusBadgeClass(status);
  return <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${className}`}>{label}</span>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 text-plum dark:text-mint">{icon}</div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-black/55 dark:text-white/55">{label}</p>
    </div>
  );
}
