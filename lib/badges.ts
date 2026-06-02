import type { SubmissionStatus } from "@/lib/types";

export function difficultyBadgeClass(difficulty: number) {
  if (difficulty <= 3) return "bg-mint/20 text-ink dark:text-paper";
  if (difficulty <= 6) return "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300";
  return "bg-coral/15 text-coral";
}

export function submissionStatusLabel(status: SubmissionStatus | string) {
  if (status === "accepted") return "Correct";
  if (status === "rejected") return "Incorrect";
  return "Pending";
}

export function submissionStatusBadgeClass(status: SubmissionStatus | string) {
  if (status === "accepted") return "bg-mint/20 text-ink dark:text-paper";
  if (status === "rejected") return "bg-orange-400/20 text-orange-700 dark:text-orange-300";
  return "bg-black/[0.06] text-black/65 dark:bg-white/[0.10] dark:text-white/70";
}

export function notificationToneClass(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("accepted")) return "bg-mint/20 text-ink dark:text-paper";
  if (normalized.includes("needs changes") || normalized.includes("incorrect") || normalized.includes("rejected")) {
    return "bg-orange-400/20 text-orange-700 dark:text-orange-300";
  }
  return "bg-coral/15 text-coral";
}

export function notificationItemClass(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("accepted")) {
    return "border-l-4 border-l-mint bg-mint/10 hover:bg-mint/15 dark:bg-mint/10 dark:hover:bg-mint/15";
  }
  if (normalized.includes("needs changes") || normalized.includes("incorrect") || normalized.includes("rejected")) {
    return "border-l-4 border-l-orange-400 bg-orange-400/10 hover:bg-orange-400/15 dark:bg-orange-400/10 dark:hover:bg-orange-400/15";
  }
  return "border-l-4 border-l-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.05]";
}
