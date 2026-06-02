import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const requestSchema = z.object({
  submissionId: z.string(),
  body: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

  const supabase = createAdminClient();
  const { data: submission } = await supabase
    .from("submissions")
    .select("id, student_id, problem_id")
    .eq("id", parsed.data.submissionId)
    .eq("student_id", user.id)
    .single();

  if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 });

  const { data: message, error } = await supabase
    .from("feedback_messages")
    .insert({
      submission_id: parsed.data.submissionId,
      author_id: user.id,
      author_role: "student",
      body: parsed.data.body,
    })
    .select("id, body, author_role, created_at")
    .single();

  if (error || !message) return NextResponse.json({ error: error?.message ?? "Cannot send message." }, { status: 500 });

  const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
  if (admins?.length) {
    await supabase.from("notifications").insert(
      admins.map((admin) => ({
        user_id: admin.id,
        title: "Student replied",
        body: parsed.data.body.slice(0, 160),
        submission_id: parsed.data.submissionId,
      })),
    );
  }

  return NextResponse.json({
    message: {
      id: message.id,
      body: message.body,
      authorRole: message.author_role,
      createdAt: message.created_at,
    },
  });
}
