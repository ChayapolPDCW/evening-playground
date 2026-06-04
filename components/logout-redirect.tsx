"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LogoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    void fetch("/logout/complete", { method: "POST" });

    const timer = window.setTimeout(() => {
      router.replace("/");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
