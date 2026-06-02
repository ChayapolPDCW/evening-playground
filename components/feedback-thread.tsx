import { Send } from "lucide-react";
import { addFeedback } from "@/app/admin/submissions/actions";

export function FeedbackThread({
  submissionId,
  messages,
}: {
  submissionId: string;
  messages: Array<{ id: string; body: string; author_role: string; created_at: string }>;
}) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <h2 className="mb-4 font-semibold">Feedback</h2>
      <div className="mb-4 max-h-[480px] space-y-3 overflow-auto">
        {messages.map((message) => (
          <div className="rounded-md bg-black/[0.03] p-3 dark:bg-white/[0.06]" key={message.id}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase text-plum dark:text-mint">{message.author_role}</span>
              <span className="text-xs text-black/45 dark:text-white/45">{new Date(message.created_at).toLocaleString()}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
          </div>
        ))}
        {!messages.length && <p className="text-sm text-black/55 dark:text-white/55">No feedback yet.</p>}
      </div>
      <form action={addFeedback} className="space-y-3">
        <input name="submissionId" type="hidden" value={submissionId} />
        <textarea className="min-h-28 w-full rounded-md border border-black/10 bg-transparent p-3 text-sm outline-none focus:border-mint dark:border-white/15" name="body" required />
        <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-mint text-sm font-semibold text-ink" type="submit">
          <Send size={16} /> Send Feedback
        </button>
      </form>
    </section>
  );
}
