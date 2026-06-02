import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { markNotificationsRead } from "@/app/notifications/actions";
import { getSessionProfile } from "@/lib/auth";
import { notificationItemClass } from "@/lib/badges";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/supabase/shape";

export default async function NotificationsPage() {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) {
    return null;
  }

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, created_at, read_at, submission_id, submissions(id, problems(title, slug))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <AppShell role={profile.role === "admin" ? "Admin" : "Student"} title="Notifications" userName={profile.full_name}>
      <form action={markNotificationsRead} className="mb-5">
        <button className="h-10 rounded-md border border-black/10 px-4 text-sm font-semibold dark:border-white/10" type="submit">
          Mark all as read
        </button>
      </form>
      <div className="rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="divide-y divide-black/10 dark:divide-white/10">
          {notifications?.map((notification) => (
            <Link
              className={`block px-5 py-4 transition ${notificationItemClass(notification.title)}`}
              href={`/notifications/${notification.id}`}
              key={notification.id}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{notification.title}</p>
                {!notification.read_at && <span className="rounded-md bg-white/85 px-2 py-0.5 text-xs font-semibold text-ink dark:bg-white/15 dark:text-paper">New</span>}
              </div>
              <p className="mt-1 text-sm font-semibold text-ink dark:text-white">{notificationProblemTitle(notification)}</p>
              <p className="mt-1 text-sm text-black/65 dark:text-white/65">{notification.body}</p>
              <p className="mt-2 text-xs text-black/45 dark:text-white/45">{new Date(notification.created_at).toLocaleString()}</p>
            </Link>
          ))}
          {!notifications?.length && <p className="px-5 py-8 text-sm text-black/55 dark:text-white/55">No notifications yet.</p>}
        </div>
      </div>
    </AppShell>
  );
}

type NotificationRow = {
  submission_id: string | null;
  submissions?: unknown;
};

function notificationProblemTitle(notification: NotificationRow) {
  const submission = one(notification.submissions as { problems?: unknown } | { problems?: unknown }[] | null | undefined);
  const problem = one(submission?.problems as { title?: string } | { title?: string }[] | null | undefined);
  return problem?.title ? `Problem: ${problem.title}` : "General notification";
}
