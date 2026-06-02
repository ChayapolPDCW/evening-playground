"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type ReviewStatus = "accepted" | "rejected";

export async function addFeedback(formData: FormData) {
  const { user } = await requireRole("admin");
  const supabase = createAdminClient();
  const submissionId = String(formData.get("submissionId") ?? "");
  const body = String(formData.get("body") ?? "");

  if (!submissionId || !body.trim()) return;

  const { data: submission } = await supabase.from("submissions").select("student_id").eq("id", submissionId).single();

  await supabase.from("feedback_messages").insert({
    submission_id: submissionId,
    author_id: user.id,
    author_role: "admin",
    body,
  });

  await supabase.from("notifications").insert({
    user_id: submission?.student_id ?? null,
    title: "New feedback",
    body: body.slice(0, 160),
    submission_id: submissionId,
  });

  revalidatePath(`/admin/submissions/${submissionId}`);
}

export async function updateSubmissionStatus(formData: FormData) {
  await requireRole("admin");
  const supabase = createAdminClient();
  const submissionId = String(formData.get("submissionId") ?? "");
  const status = String(formData.get("status") ?? "") as ReviewStatus;

  if (!submissionId || !["accepted", "rejected"].includes(status)) return;

  const { data: submission } = await supabase.from("submissions").select("student_id").eq("id", submissionId).single();
  await supabase.from("submissions").update({ status, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", submissionId);
  await supabase.from("notifications").insert({
    user_id: submission?.student_id ?? null,
    title: status === "accepted" ? "Submission accepted" : "Submission needs changes",
    body: status === "accepted" ? "Your submission was reviewed and accepted." : "Your submission was reviewed and marked incorrect.",
    submission_id: submissionId,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${submissionId}`);
}
