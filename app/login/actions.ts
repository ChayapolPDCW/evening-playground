"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { usernameToInternalEmail } from "@/lib/auth-identity";

export async function login(formData: FormData) {
  if (!hasSupabaseConfig()) redirect("/login?error=config");

  const username = String(formData.get("username") ?? "");
  const email = usernameToInternalEmail(username);
  const password = String(formData.get("password") ?? "");

  let destination = "/login?error=invalid";

  if (!email || !password) redirect(destination);

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).single();
      if (profile?.role === "admin") destination = "/admin";
      else if (profile?.role === "student") destination = "/playground";
      else destination = "/login?error=profile";
    }
  } catch {
    destination = "/login?error=config";
  }

  redirect(destination);
}
