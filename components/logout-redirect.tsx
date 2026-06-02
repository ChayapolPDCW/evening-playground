"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LogoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
