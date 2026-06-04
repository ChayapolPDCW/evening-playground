import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { difficultyBadgeClass, submissionStatusBadgeClass, submissionStatusLabel } from "@/lib/badges";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/supabase/shape";
import type { LatestSubmission, Problem, SubmissionStatus } from "@/lib/types";

export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { user, profile } = await requireRole("student");
  const { status = "all" } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("problem_assignments")
    .select("problems(id, title, slug, prompt, image_url, difficulty, starter_code, published, created_at)")
    .eq("student_id", user.id)
    .eq("problems.published", true)
    .order("assigned_at", { ascending: false });

  const assigned = data
    ?.map((row) => one(row.problems))
    .filter((problem): problem is NonNullable<typeof problem> => Boolean(problem))
    .map((problem) => ({
      id: problem.id,
      title: problem.title,
      slug: problem.slug,
      prompt: problem.prompt,
      imageUrl: problem.image_url,
      difficulty: problem.difficulty,
      starterCode: problem.starter_code,
      published: problem.published,
      createdAt: problem.created_at,
    })) as Problem[] | undefined;

  const problems = assigned ?? [];
  const latestByProblem = new Map<string, LatestSubmission>();

  if (assigned?.length) {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("id, problem_id, status, passed_count, total_count, created_at")
      .eq("student_id", user.id)
      .in(
        "problem_id",
        assigned.map((problem) => problem.id),
      )
      .order("created_at", { ascending: false });

    submissions?.forEach((submission) => {
      if (latestByProblem.has(submission.problem_id)) return;
      latestByProblem.set(submission.problem_id, {
        id: submission.id,
        problemId: submission.problem_id,
        status: submission.status as SubmissionStatus,
        passedCount: submission.passed_count,
        totalCount: submission.total_count,
        createdAt: submission.created_at,
      });
    });
  }

  const filteredProblems = problems.filter((problem) => {
    const latest = latestByProblem.get(problem.id);
    if (status === "all") return true;
    if (status === "unsubmitted") return !latest;
    return latest?.status === status;
  });

  return (
    <AppShell role="Student" title="My Problems" userName={profile.full_name}>
      <form className="mb-5 flex flex-wrap items-center gap-3" action="/playground">
        <label className="text-sm font-semibold" htmlFor="status">
          Filter status
        </label>
        <select
          className="h-10 rounded-md border border-black/10 bg-white px-3 text-sm text-ink outline-none dark:border-white/10 dark:bg-[#202020] dark:text-paper"
          defaultValue={status}
          id="status"
          name="status"
        >
          <option className="bg-white text-ink dark:bg-[#202020] dark:text-paper" value="all">All</option>
          <option className="bg-white text-ink dark:bg-[#202020] dark:text-paper" value="unsubmitted">Unsubmitted</option>
          <option className="bg-white text-ink dark:bg-[#202020] dark:text-paper" value="pending">Pending</option>
          <option className="bg-white text-ink dark:bg-[#202020] dark:text-paper" value="accepted">Correct</option>
          <option className="bg-white text-ink dark:bg-[#202020] dark:text-paper" value="rejected">Incorrect</option>
        </select>
        <button className="h-10 rounded-md bg-ink px-4 text-sm font-semibold text-paper dark:bg-paper dark:text-ink" type="submit">
          Apply
        </button>
      </form>

      {filteredProblems.length ? (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProblems.map((problem) => (
          <Link
            className="group rounded-lg border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-white/10 dark:bg-white/5"
            href={`/playground/${problem.slug}`}
            key={problem.id}
          >
            <div className="mb-4 flex items-center justify-between">
              <BookOpen className="text-plum dark:text-mint" size={20} />
              <div className="flex items-center gap-2">
                {latestByProblem.get(problem.id) && <SubmissionStatusBadge status={latestByProblem.get(problem.id)!.status} />}
                <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${difficultyBadgeClass(problem.difficulty)}`}>
                  Level {problem.difficulty}/10
                </span>
              </div>
            </div>
            <h2 className="text-lg font-semibold group-hover:text-plum dark:group-hover:text-mint">{problem.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-black/60 dark:text-white/60">{problem.prompt}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-mint">
              <CheckCircle2 size={16} /> Open practice
            </div>
          </Link>
        ))}
      </div>
      ) : (
        <div className="rounded-lg border border-black/10 bg-white p-8 text-sm text-black/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
          {problems.length ? "No problems match this filter." : "No problems assigned yet. Please ask your admin to create or assign a problem."}
        </div>
      )}
    </AppShell>
  );
}

function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const label = submissionStatusLabel(status);
  const className = submissionStatusBadgeClass(status);
  return <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}
