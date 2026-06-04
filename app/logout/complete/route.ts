import { NextResponse } from "next/server";
import { clearSessionStarted } from "@/lib/session-timeout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearSessionStarted();

  return NextResponse.json({ ok: true });
}
