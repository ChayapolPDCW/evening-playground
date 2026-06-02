import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { notificationItemClass } from "@/lib/badges";
import { createClient } from "@/lib/supabase/server";
import { one } from "@/lib/supabase/shape";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  submission_id: string | null;
  submissions?: unknown;
};

export async function AppShell({
  title,
  role,
  userName,
  children,
}: {
  title: string;
  role: "Admin" | "Student";
  userName?: string | null;
  children: React.ReactNode;
}) {
  const homeHref = role === "Admin" ? "/admin" : "/playground";
  const displayName = userName || role;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { count: unreadCount } = user
    ? await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null)
    : { count: 0 };
  const { data: notifications } = user
    ? await supabase
        .from("notifications")
        .select("id, title, body, read_at, created_at, submission_id, submissions(id, problems(title, slug))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  return (
    <main className="min-h-screen bg-paper text-ink dark:bg-[#151515] dark:text-paper">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-paper/90 backdrop-blur dark:border-white/10 dark:bg-[#151515]/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link className="brand-wave font-semibold" href={homeHref}>
            Evening Playground
          </Link>
          <div className="flex items-center gap-3">
            <span className="max-w-44 truncate rounded-md border border-black/10 px-3 py-1.5 text-xs font-semibold dark:border-white/10" title={`${role}: ${displayName}`}>
              {displayName}
            </span>
            <ThemeToggle />
            <div className="group relative -m-2 p-2">
              <Link
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/10"
                href="/notifications"
                title="Notifications"
              >
                <Bell size={17} />
                {!!unreadCount && (
                  <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-coral px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <div className="pointer-events-none absolute right-0 top-full z-20 w-80 pt-2 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="rounded-lg border border-black/10 bg-white shadow-soft dark:border-white/10 dark:bg-[#202020]">
                  <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
                    <p className="text-sm font-semibold">Notifications</p>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {(notifications as NotificationRow[] | null)?.map((notification) => (
                      <Link
                        className={`block border-b border-black/10 px-4 py-3 text-sm transition last:border-b-0 dark:border-white/10 ${notificationItemClass(notification.title)}`}
                        href={`/notifications/${notification.id}`}
                        key={notification.id}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{notification.title}</p>
                          {!notification.read_at && <span className="rounded-md bg-white/85 px-2 py-0.5 text-[10px] font-bold text-ink dark:bg-white/15 dark:text-paper">New</span>}
                        </div>
                        <p className="mt-1 text-xs font-semibold text-ink dark:text-white">{notificationProblemTitle(notification)}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-black/55 dark:text-white/55">{notification.body}</p>
                      </Link>
                    ))}
                    {!notifications?.length && <p className="px-4 py-5 text-sm text-black/55 dark:text-white/55">No notifications yet.</p>}
                  </div>
                  <Link className="block px-4 py-3 text-center text-sm font-semibold text-mint" href="/notifications">
                    View all
                  </Link>
                </div>
              </div>
            </div>
            <Link className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/10" href="/logout" title="Logout">
              <LogOut size={17} />
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-5 py-8">
        <h1 className="mb-6 text-3xl font-semibold">{title}</h1>
        {children}
      </div>
    </main>
  );
}

function notificationProblemTitle(notification: NotificationRow) {
  const submission = one(notification.submissions as { problems?: unknown } | { problems?: unknown }[] | null | undefined);
  const problem = one(submission?.problems as { title?: string } | { title?: string }[] | null | undefined);
  return problem?.title ? `Problem: ${problem.title}` : "General notification";
}
