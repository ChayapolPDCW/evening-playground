import { cookies } from "next/headers";

const sessionStartedCookie = "ep_session_started_at";
export const sessionMaxAgeSeconds = 60 * 60 * 3;

export async function markSessionStarted() {
  const cookieStore = await cookies();
  cookieStore.set(sessionStartedCookie, String(Date.now()), {
    httpOnly: true,
    maxAge: sessionMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionStarted() {
  const cookieStore = await cookies();
  cookieStore.set(sessionStartedCookie, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function isSessionExpired() {
  const cookieStore = await cookies();
  const startedAt = Number(cookieStore.get(sessionStartedCookie)?.value);
  if (!startedAt) return false;

  return Date.now() - startedAt > sessionMaxAgeSeconds * 1000;
}
