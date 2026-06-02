import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { FeedbackThread } from "@/components/feedback-thread";
import { updateSubmissionStatus } from "@/app/admin/submissions/actions";
import { requireRole } from "@/lib/auth";
import { submissionStatusBadgeClass, submissionStatusLabel } from "@/lib/badges";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/supabase/shape";

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: submission }, { data: messages }] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, code, note, status, passed_count, total_count, created_at, updated_at, reviewed_at, problems(title), profiles(full_name)")
      .eq("id", id)
      .single(),
    supabase
      .from("feedback_messages")
      .select("id, body, author_role, created_at")
      .eq("submission_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!submission) notFound();

  return (
    <AppShell role="Admin" title="Review Submission" userName={profile.full_name}>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{one(submission.problems)?.title ?? "Untitled problem"}</h2>
              <p className="text-sm text-black/55 dark:text-white/55">{one(submission.profiles)?.full_name ?? "Student"}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={submission.status} />
              <span className="rounded-md bg-black/[0.04] px-2.5 py-1 text-sm font-semibold dark:bg-white/[0.08]">
                Tests {submission.passed_count}/{submission.total_count}
              </span>
            </div>
          </div>
          <div className="mb-4 grid gap-2 text-sm text-black/55 dark:text-white/55 sm:grid-cols-2">
            <p>Submitted: {new Date(submission.created_at).toLocaleString()}</p>
            <p>Last review update: {submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleString() : "Not reviewed yet"}</p>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <form action={updateSubmissionStatus}>
              <input name="submissionId" type="hidden" value={id} />
              <input name="status" type="hidden" value="accepted" />
              <button className="h-9 rounded-md bg-mint px-3 text-sm font-semibold text-ink" type="submit">
                Mark Correct
              </button>
            </form>
            <form action={updateSubmissionStatus}>
              <input name="submissionId" type="hidden" value={id} />
              <input name="status" type="hidden" value="rejected" />
              <button className="h-9 rounded-md border border-coral/35 px-3 text-sm font-semibold text-coral" type="submit">
                Mark Incorrect
              </button>
            </form>
          </div>
          {submission.note && <p className="mb-4 rounded-md bg-black/[0.03] p-3 text-sm dark:bg-white/[0.06]">{submission.note}</p>}
          <pre className="max-h-[620px] overflow-auto rounded-md bg-[#202020] p-4 text-sm leading-6 text-paper">
            <code>{submission.code}</code>
          </pre>
        </section>
        <FeedbackThread messages={messages ?? []} submissionId={id} />
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = submissionStatusLabel(status);
  const className = submissionStatusBadgeClass(status);
  return <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${className}`}>{label}</span>;
}
