import { LogoutRedirect } from "@/components/logout-redirect";
import { createClient } from "@/lib/supabase/server";

export default async function LogoutPage() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 text-ink dark:bg-[#151515] dark:text-paper">
      <div className="w-full max-w-md text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Goodbye" className="mx-auto max-h-80 w-full rounded-lg object-contain" src="/gif/farewell.gif" />
        <p className="mt-5 text-sm font-semibold text-black/60 dark:text-white/65">Logging out...</p>
      </div>
      <LogoutRedirect />
    </main>
  );
}
