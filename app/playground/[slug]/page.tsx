import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PracticeWorkspace } from "@/components/practice-workspace";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FeedbackMessage, Problem, SubmissionStatus, TestCase } from "@/lib/types";

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user, profile } = await requireRole("student");
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("problems")
    .select("id, title, slug, prompt, image_url, difficulty, starter_code, published, created_at, test_cases(id, name, input, expected_output, is_hidden, order_index)")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  const problem = data
    ? ({
        id: data.id,
        title: data.title,
        slug: data.slug,
        prompt: data.prompt,
        imageUrl: data.image_url,
        difficulty: data.difficulty,
        starterCode: data.starter_code,
        published: data.published,
        createdAt: data.created_at,
      } satisfies Problem)
    : null;

  if (!problem) notFound();

  const testCases: TestCase[] = data?.test_cases
    ? data.test_cases.map((test) => ({
        id: test.id,
        name: test.name,
        input: test.input,
        expectedOutput: test.expected_output,
        isHidden: test.is_hidden,
        orderIndex: test.order_index,
      }))
    : [];

  const { data: latestSubmission } = data
    ? await supabase
        .from("submissions")
        .select("id, status")
        .eq("problem_id", problem.id)
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const { data: feedbackMessages } = latestSubmission?.id
    ? await supabase
        .from("feedback_messages")
        .select("id, body, author_role, created_at")
        .eq("submission_id", latestSubmission.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const messages: FeedbackMessage[] =
    feedbackMessages?.map((message) => ({
      id: message.id,
      body: message.body,
      authorRole: message.author_role,
      createdAt: message.created_at,
    })) ?? [];

  return (
    <AppShell role="Student" title={problem.title} userName={profile.full_name}>
      <PracticeWorkspace
        initialMessages={messages}
        initialStatus={(latestSubmission?.status as SubmissionStatus | undefined) ?? null}
        initialSubmissionId={latestSubmission?.id ?? null}
        problem={problem}
        testCases={testCases}
      />
    </AppShell>
  );
}
