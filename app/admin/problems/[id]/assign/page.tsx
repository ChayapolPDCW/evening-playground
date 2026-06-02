import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { updateProblemAssignments } from "@/app/admin/problems/actions";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AssignProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: problem }, { data: students }, { data: assignments }] = await Promise.all([
    supabase.from("problems").select("id, title").eq("id", id).single(),
    supabase.from("profiles").select("id, full_name").eq("role", "student").order("full_name"),
    supabase.from("problem_assignments").select("student_id").eq("problem_id", id),
  ]);

  if (!problem) notFound();
  const assigned = new Set(assignments?.map((assignment) => assignment.student_id));

  return (
    <AppShell role="Admin" title={`Assign: ${problem.title}`} userName={profile.full_name}>
      <form action={updateProblemAssignments} className="max-w-2xl rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <input name="problemId" type="hidden" value={id} />
        <div className="space-y-3">
          {students?.map((student) => (
            <label className="flex items-center justify-between rounded-md border border-black/10 p-3 text-sm dark:border-white/10" key={student.id}>
              <span className="font-medium">{student.full_name ?? "Unnamed student"}</span>
              <input className="h-5 w-5 accent-mint" defaultChecked={assigned.has(student.id)} name="studentIds" type="checkbox" value={student.id} />
            </label>
          ))}
          {!students?.length && <p className="text-sm text-black/55 dark:text-white/55">No students yet.</p>}
        </div>
        <button className="mt-5 h-10 rounded-md bg-mint px-4 text-sm font-semibold text-ink" type="submit">
          Save Assignments
        </button>
      </form>
    </AppShell>
  );
}
