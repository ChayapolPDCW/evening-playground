"use client";

export function SubmitCelebration({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="rounded-lg border border-mint/30 bg-mint/10 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="Submitted" className="max-h-44 w-full rounded-md object-contain" src="/gif/nice.gif" />
    </div>
  );
}
