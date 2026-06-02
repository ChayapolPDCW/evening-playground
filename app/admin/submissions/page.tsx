import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { submissionStatusBadgeClass, submissionStatusLabel } from "@/lib/badges";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/supabase/shape";

export default async function SubmissionsPage() {
  const { profile } = await requireRole("admin");
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, status, passed_count, total_count, note, created_at, reviewed_at, problems(title), profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <AppShell role="Admin" title="Submissions" userName={profile.full_name}>
      <div className="rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="divide-y divide-black/10 dark:divide-white/10">
          {submissions?.map((submission) => (
            <Link className="grid gap-2 px-5 py-4 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.05] md:grid-cols-[1fr_auto]" href={`/admin/submissions/${submission.id}`} key={submission.id}>
              <div>
                <p className="font-medium">{one(submission.problems)?.title ?? "Untitled problem"}</p>
                <p className="text-sm text-black/55 dark:text-white/55">{one(submission.profiles)?.full_name ?? "Student"}</p>
                <p className="mt-1 text-xs text-black/45 dark:text-white/45">
                  Submitted {new Date(submission.created_at).toLocaleString()} · Reviewed {submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleString() : "pending"}
                </p>
                {submission.note && <p className="mt-2 text-sm text-black/65 dark:text-white/65">{submission.note}</p>}
              </div>
              <div className="flex items-start gap-2 md:justify-end">
                <StatusBadge status={submission.status} />
                <span className="h-fit rounded-md bg-black/[0.04] px-2.5 py-1 text-sm font-semibold dark:bg-white/[0.08]">
                  {submission.passed_count}/{submission.total_count}
                </span>
              </div>
            </Link>
          ))}
          {!submissions?.length && <p className="px-5 py-8 text-sm text-black/55 dark:text-white/55">No submissions yet.</p>}
        </div>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = submissionStatusLabel(status);
  const className = submissionStatusBadgeClass(status);
  return <span className={`h-fit rounded-md px-2.5 py-1 text-sm font-semibold ${className}`}>{label}</span>;
}
