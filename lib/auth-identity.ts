const INTERNAL_AUTH_DOMAIN = "evening-playground.local";

export function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

export function usernameToInternalEmail(username: string) {
  const normalized = normalizeUsername(username);
  if (!normalized) return "";
  return `${normalized}@${INTERNAL_AUTH_DOMAIN}`;
}
