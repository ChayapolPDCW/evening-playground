import Link from "next/link";
import { Edit3, FilePlus2, Trash2, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { deleteProblem } from "@/app/admin/problems/actions";
import { requireRole } from "@/lib/auth";
import { difficultyBadgeClass } from "@/lib/badges";
import { createClient } from "@/lib/supabase/server";

export default async function ProblemsPage() {
  const { profile } = await requireRole("admin");
  const supabase = await createClient();
  const { data: problems } = await supabase
    .from("problems")
    .select("id, title, slug, difficulty, published, created_at, problem_assignments(student_id)")
    .order("created_at", { ascending: false });

  return (
    <AppShell role="Admin" title="Problems" userName={profile.full_name}>
      <div className="mb-5">
        <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-ink" href="/admin/problems/new">
          <FilePlus2 size={17} /> New Problem
        </Link>
      </div>
      <div className="rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="divide-y divide-black/10 dark:divide-white/10">
          {problems?.map((problem) => (
            <div className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto]" key={problem.id}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{problem.title}</h2>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${difficultyBadgeClass(problem.difficulty)}`}>{problem.difficulty}/10</span>
                  <span className="rounded-md bg-black/[0.05] px-2 py-0.5 text-xs font-semibold dark:bg-white/[0.08]">
                    {problem.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-black/55 dark:text-white/55">
                  /{problem.slug} · assigned to {problem.problem_assignments?.length ?? 0} student(s)
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link className="inline-flex h-9 items-center gap-2 rounded-md border border-black/10 px-3 text-sm font-semibold dark:border-white/10" href={`/admin/problems/${problem.id}/assign`}>
                  <Users size={16} /> Assign
                </Link>
                <Link className="inline-flex h-9 items-center gap-2 rounded-md border border-black/10 px-3 text-sm font-semibold dark:border-white/10" href={`/admin/problems/${problem.id}/edit`}>
                  <Edit3 size={16} /> Edit
                </Link>
                <form action={deleteProblem}>
                  <input name="problemId" type="hidden" value={problem.id} />
                  <button className="inline-flex h-9 items-center gap-2 rounded-md border border-coral/35 px-3 text-sm font-semibold text-coral" type="submit">
                    <Trash2 size={16} /> Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
          {!problems?.length && <p className="px-5 py-8 text-sm text-black/55 dark:text-white/55">No problems yet.</p>}
        </div>
      </div>
    </AppShell>
  );
}
