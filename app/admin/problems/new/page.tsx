import { AppShell } from "@/components/app-shell";
import { ProblemForm } from "@/components/problem-form";
import { requireRole } from "@/lib/auth";

export default async function NewProblemPage() {
  const { profile } = await requireRole("admin");

  return (
    <AppShell role="Admin" title="Create Problem" userName={profile.full_name}>
      <ProblemForm />
    </AppShell>
  );
}
