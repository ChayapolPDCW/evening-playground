import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomePracticeGif } from "@/components/home-practice-gif";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper text-ink dark:bg-[#151515] dark:text-paper">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link className="brand-wave text-lg font-semibold" href="/">
          Evening Playground
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper transition hover:opacity-90 dark:bg-paper dark:text-ink"
            href="/login"
          >
            Login <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-90px)] w-full max-w-6xl items-center gap-10 px-5 pb-12 pt-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="typing-label mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-coral">
            Private Coding
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
            Evening Playground
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-black/65 dark:text-white">
            Friday evenings, heading straight from school to the playground.  
            Just realized how quickly time went by.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-md bg-mint px-5 text-sm font-semibold text-ink transition hover:brightness-95"
              href="/login"
            >
              Login <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div>
          <HomePracticeGif />
        </div>
      </section>
    </main>
  );
}
