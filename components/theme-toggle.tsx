"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      aria-label="Toggle theme"
      title="Toggle theme"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white/70 text-ink shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-paper dark:hover:bg-white/15"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      {mounted ? isDark ? <Sun size={18} /> : <Moon size={18} /> : <span className="h-[18px] w-[18px]" />}
    </button>
  );
}
