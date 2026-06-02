import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProblemForm } from "@/components/problem-form";
import { updateProblem } from "@/app/admin/problems/actions";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function EditProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();
  const { data: problem } = await supabase
    .from("problems")
    .select("id, title, slug, prompt, image_url, difficulty, starter_code, published, test_cases(name, input, expected_output, is_hidden, order_index)")
    .eq("id", id)
    .single();

  if (!problem) notFound();

  return (
    <AppShell role="Admin" title="Edit Problem" userName={profile.full_name}>
      <ProblemForm
        action={updateProblem}
        submitLabel="Update Problem"
        initial={{
          id: problem.id,
          title: problem.title,
          slug: problem.slug,
          prompt: problem.prompt,
          imageUrl: problem.image_url ?? "",
          difficulty: problem.difficulty,
          starterCode: problem.starter_code,
          published: problem.published,
          tests: [...(problem.test_cases ?? [])]
            .sort((a, b) => a.order_index - b.order_index)
            .map((test) => ({
              name: test.name,
              input: test.input,
              expectedOutput: test.expected_output,
              isHidden: test.is_hidden,
            })),
        }}
      />
    </AppShell>
  );
}
