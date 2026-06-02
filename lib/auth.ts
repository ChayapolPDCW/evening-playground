import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export async function getSessionProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, profile: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .single();

    return { user, profile: profile as { id: string; full_name: string | null; role: Role } | null };
  } catch {
    return { user: null, profile: null };
  }
}

export async function requireRole(role: Role) {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) redirect("/login");
  if (profile.role !== role) redirect(profile.role === "admin" ? "/admin" : "/playground");
  return { user, profile };
}
