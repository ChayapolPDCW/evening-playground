import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { removeStudentAssignment } from "@/app/admin/students/actions";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/supabase/shape";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: assignments }, { data: submissions }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("id", id).eq("role", "student").single(),
    supabase.from("problem_assignments").select("problem_id, assigned_at, problems(id, title, slug)").eq("student_id", id).order("assigned_at", { ascending: false }),
    supabase.from("submissions").select("id, status, passed_count, total_count, created_at, reviewed_at, problems(id, title, slug)").eq("student_id", id).order("created_at", { ascending: false }),
  ]);

  if (!student) notFound();
  const latestByProblem = new Map<string, NonNullable<typeof submissions>[number]>();
  submissions?.forEach((submission) => {
    const problem = one(submission.problems);
    if (!problem || latestByProblem.has(problem.id)) return;
    latestByProblem.set(problem.id, submission);
  });

  return (
    <AppShell role="Admin" title={student.full_name ?? "Student"} userName={profile.full_name}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
            <h2 className="font-semibold">Assigned Problems</h2>
          </div>
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {assignments?.map((assignment) => {
              const problem = one(assignment.problems);
              const latest = problem ? latestByProblem.get(problem.id) : null;
              return (
                <div className="flex items-center justify-between gap-4 px-5 py-4" key={assignment.problem_id}>
                  <div>
                    <p className="font-medium">{problem?.title ?? "Deleted problem"}</p>
                    <p className="text-sm text-black/55 dark:text-white/55">{latest ? `${latest.status} · ${latest.passed_count}/${latest.total_count}` : "Not submitted yet"}</p>
                  </div>
                  <form action={removeStudentAssignment}>
                    <input name="studentId" type="hidden" value={id} />
                    <input name="problemId" type="hidden" value={assignment.problem_id} />
                    <button className="inline-flex h-9 items-center gap-2 rounded-md border border-coral/35 px-3 text-sm font-semibold text-coral" type="submit">
                      <Trash2 size={16} /> Remove
                    </button>
                  </form>
                </div>
              );
            })}
            {!assignments?.length && <p className="px-5 py-8 text-sm text-black/55 dark:text-white/55">No assigned problems.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-black/10 px-5 py-4 dark:border-white/10">
            <h2 className="font-semibold">Submission History</h2>
          </div>
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {submissions?.map((submission) => (
              <div className="px-5 py-4" key={submission.id}>
                <p className="font-medium">{one(submission.problems)?.title ?? "Untitled problem"}</p>
                <p className="text-sm text-black/55 dark:text-white/55">
                  {submission.status} · {submission.passed_count}/{submission.total_count} · submitted {new Date(submission.created_at).toLocaleString()}
                </p>
                <p className="text-xs text-black/45 dark:text-white/45">
                  Reviewed {submission.reviewed_at ? new Date(submission.reviewed_at).toLocaleString() : "pending"}
                </p>
              </div>
            ))}
            {!submissions?.length && <p className="px-5 py-8 text-sm text-black/55 dark:text-white/55">No submissions yet.</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
