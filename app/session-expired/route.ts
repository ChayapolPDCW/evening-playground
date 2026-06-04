import { redirect } from "next/navigation";
import { clearSessionStarted } from "@/lib/session-timeout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearSessionStarted();
  redirect("/");
}
