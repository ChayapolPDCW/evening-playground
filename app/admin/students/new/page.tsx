import { UserPlus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createStudent } from "@/app/admin/students/actions";
import { requireRole } from "@/lib/auth";

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const { profile } = await requireRole("admin");
  const params = await searchParams;

  return (
    <AppShell role="Admin" title="Create Student Account" userName={profile.full_name}>
      <div className="max-w-xl rounded-lg border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        {params.created && (
          <div className="mb-4 rounded-md border border-mint/35 bg-mint/10 px-3 py-2 text-sm text-ink dark:text-paper">
            Student account created.
          </div>
        )}
        {params.error && (
          <div className="mb-4 rounded-md border border-coral/35 bg-coral/10 px-3 py-2 text-sm text-coral">
            Could not create student. Check username, password, and Supabase service role key.
          </div>
        )}

        <form action={createStudent} className="space-y-4">
          <label className="block text-sm font-medium">
            Student name
            <input
              className="mt-2 h-11 w-full rounded-md border border-black/10 bg-transparent px-3 outline-none focus:border-mint dark:border-white/15"
              name="fullName"
              placeholder="Student One"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Username
            <input
              className="mt-2 h-11 w-full rounded-md border border-black/10 bg-transparent px-3 outline-none focus:border-mint dark:border-white/15"
              name="username"
              placeholder="student1"
              required
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              className="mt-2 h-11 w-full rounded-md border border-black/10 bg-transparent px-3 outline-none focus:border-mint dark:border-white/15"
              minLength={6}
              name="password"
              required
              type="password"
            />
          </label>
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-mint text-sm font-semibold text-ink transition hover:brightness-95"
            type="submit"
          >
            <UserPlus size={17} /> Create Student
          </button>
        </form>
      </div>
    </AppShell>
  );
}
