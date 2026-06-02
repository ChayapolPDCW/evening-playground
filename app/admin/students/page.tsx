import Link from "next/link";
import { Trash2, UserPlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { deleteStudent } from "@/app/admin/students/actions";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StudentsPage() {
  const { profile } = await requireRole("admin");
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, problem_assignments(problem_id), submissions(id, status)")
    .eq("role", "student")
    .order("full_name");

  return (
    <AppShell role="Admin" title="Students" userName={profile.full_name}>
      <div className="mb-5">
        <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-ink" href="/admin/students/new">
          <UserPlus size={17} /> Create Student
        </Link>
      </div>
      <div className="rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="divide-y divide-black/10 dark:divide-white/10">
          {students?.map((student) => {
            const completed = student.submissions?.filter((submission) => submission.status === "accepted").length ?? 0;
            return (
              <div className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto]" key={student.id}>
                <div>
                  <Link className="font-semibold transition hover:text-plum dark:hover:text-mint" href={`/admin/students/${student.id}`}>
                    {student.full_name ?? "Unnamed student"}
                  </Link>
                  <p className="text-sm text-black/55 dark:text-white/55">{student.problem_assignments?.length ?? 0} assigned problem(s)</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <span className="h-fit rounded-md bg-black/[0.04] px-2.5 py-1 text-sm font-semibold dark:bg-white/[0.08]">
                    {completed} correct
                  </span>
                  <Link className="h-9 rounded-md border border-black/10 px-3 py-2 text-sm font-semibold dark:border-white/10" href={`/admin/students/${student.id}`}>
                    View
                  </Link>
                  <form action={deleteStudent}>
                    <input name="studentId" type="hidden" value={student.id} />
                    <ConfirmSubmitButton
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-coral/35 px-3 text-sm font-semibold text-coral"
                      message={`Delete ${student.full_name ?? "this student"}? This removes their login account and related data.`}
                    >
                      <Trash2 size={16} /> Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            );
          })}
          {!students?.length && <p className="px-5 py-8 text-sm text-black/55 dark:text-white/55">No students yet.</p>}
        </div>
      </div>
    </AppShell>
  );
}
