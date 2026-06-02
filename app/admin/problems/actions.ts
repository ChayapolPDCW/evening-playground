"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createProblem(formData: FormData) {
  await requireRole("admin");
  const supabase = createAdminClient();
  const title = String(formData.get("title") ?? "");
  const slug = slugify(String(formData.get("slug") || title));
  const testCases = JSON.parse(String(formData.get("testCases") ?? "[]")) as Array<{
    name: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;

  const { data: problem, error } = await supabase
    .from("problems")
    .insert({
      title,
      slug,
      prompt: String(formData.get("prompt") ?? ""),
      image_url: String(formData.get("imageUrl") || "") || null,
      difficulty: Number(formData.get("difficulty") ?? 1),
      starter_code: String(formData.get("starterCode") ?? ""),
      published: formData.get("published") === "on",
    })
    .select("id")
    .single();

  if (error || !problem) throw new Error(error?.message ?? "Failed to create problem.");

  if (testCases.length) {
    await supabase.from("test_cases").insert(
      testCases.map((testCase, index) => ({
        problem_id: problem.id,
        name: testCase.name,
        input: testCase.input,
        expected_output: testCase.expectedOutput,
        is_hidden: testCase.isHidden,
        order_index: index + 1,
      })),
    );
  }

  redirect("/admin/problems");
}

export async function updateProblem(formData: FormData) {
  await requireRole("admin");
  const supabase = createAdminClient();
  const problemId = String(formData.get("problemId") ?? "");
  const title = String(formData.get("title") ?? "");
  const slug = slugify(String(formData.get("slug") || title));
  const testCases = JSON.parse(String(formData.get("testCases") ?? "[]")) as Array<{
    name: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;

  if (!problemId) redirect("/admin/problems");

  const { error } = await supabase
    .from("problems")
    .update({
      title,
      slug,
      prompt: String(formData.get("prompt") ?? ""),
      image_url: String(formData.get("imageUrl") || "") || null,
      difficulty: Number(formData.get("difficulty") ?? 1),
      starter_code: String(formData.get("starterCode") ?? ""),
      published: formData.get("published") === "on",
    })
    .eq("id", problemId);

  if (error) throw new Error(error.message);

  await supabase.from("test_cases").delete().eq("problem_id", problemId);
  if (testCases.length) {
    await supabase.from("test_cases").insert(
      testCases.map((testCase, index) => ({
        problem_id: problemId,
        name: testCase.name,
        input: testCase.input,
        expected_output: testCase.expectedOutput,
        is_hidden: testCase.isHidden,
        order_index: index + 1,
      })),
    );
  }

  revalidatePath("/admin/problems");
  redirect("/admin/problems");
}

export async function deleteProblem(formData: FormData) {
  await requireRole("admin");
  const supabase = createAdminClient();
  const problemId = String(formData.get("problemId") ?? "");
  if (problemId) await supabase.from("problems").delete().eq("id", problemId);
  revalidatePath("/admin/problems");
}

export async function updateProblemAssignments(formData: FormData) {
  await requireRole("admin");
  const supabase = createAdminClient();
  const problemId = String(formData.get("problemId") ?? "");
  const studentIds = formData.getAll("studentIds").map(String);

  if (!problemId) redirect("/admin/problems");

  await supabase.from("problem_assignments").delete().eq("problem_id", problemId);
  if (studentIds.length) {
    await supabase.from("problem_assignments").insert(
      studentIds.map((studentId) => ({
        problem_id: problemId,
        student_id: studentId,
      })),
    );
  }

  revalidatePath(`/admin/problems/${problemId}/assign`);
  redirect("/admin/problems");
}
