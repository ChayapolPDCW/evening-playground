import { login } from "@/app/login/actions";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 text-ink dark:bg-[#151515] dark:text-paper">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Evening Playground</h1>
            <p className="text-sm text-black/55 dark:text-white/55">Sign in with your class account.</p>
          </div>
          <ThemeToggle />
        </div>
        {params.error && (
          <div className="mb-4 rounded-md border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
            Login failed. Please check your username, password, Supabase keys, and profile role.
          </div>
        )}
        <form action={login} className="space-y-4 rounded-lg border border-black/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
          <label className="block text-sm font-medium">
            Username
            <input className="mt-2 h-11 w-full rounded-md border border-black/10 bg-transparent px-3 outline-none focus:border-mint dark:border-white/15" name="username" required />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input className="mt-2 h-11 w-full rounded-md border border-black/10 bg-transparent px-3 outline-none focus:border-mint dark:border-white/15" name="password" type="password" required />
          </label>
          <button className="h-11 w-full rounded-md bg-ink text-sm font-semibold text-paper transition hover:opacity-90 dark:bg-paper dark:text-ink" type="submit">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
