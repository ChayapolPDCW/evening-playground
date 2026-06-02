import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { one } from "@/lib/supabase/shape";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) redirect("/login");

  const supabase = createAdminClient();
  const { data: notification } = await supabase
    .from("notifications")
    .select("id, user_id, submission_id, submissions(id, problems(slug))")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!notification) redirect("/notifications");

  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);

  if (!notification.submission_id) redirect("/notifications");
  if (profile.role === "admin") redirect(`/admin/submissions/${notification.submission_id}`);

  const submission = one(notification.submissions as { problems?: unknown } | { problems?: unknown }[] | null | undefined);
  const problem = one(submission?.problems as { slug?: string } | { slug?: string }[] | null | undefined);
  redirect(problem?.slug ? `/playground/${problem.slug}` : "/notifications");
}
