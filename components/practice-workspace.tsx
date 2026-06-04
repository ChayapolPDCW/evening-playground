"use client";

import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import { Image as ImageIcon, Play, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { SubmitCelebration } from "@/components/submit-celebration";
import { difficultyBadgeClass, submissionStatusBadgeClass, submissionStatusLabel } from "@/lib/badges";
import type { FeedbackMessage, Problem, SubmissionStatus, TestCase } from "@/lib/types";

export function PracticeWorkspace({
  problem,
  testCases,
  initialStatus,
  initialSubmissionId,
  initialMessages = [],
}: {
  problem: Problem;
  testCases: TestCase[];
  initialStatus?: SubmissionStatus | null;
  initialSubmissionId?: string | null;
  initialMessages?: FeedbackMessage[];
}) {
  const [code, setCode] = useState(problem.starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(initialStatus ?? null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showNiceGif, setShowNiceGif] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(initialSubmissionId ?? null);
  const [feedbackBody, setFeedbackBody] = useState("");
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>(initialMessages);
  const visibleCases = useMemo(() => testCases.filter((test) => !test.isHidden), [testCases]);

  async function runCode(submit = false) {
    setIsRunning(true);
    setSubmitMessage("");
    if (submit) setShowNiceGif(false);
    let payload: { submitted?: boolean; status?: SubmissionStatus; submissionId?: string; error?: string };

    try {
      const response = await fetch("/api/run-python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, code, testCases, submit, note: "" }),
      });
      payload = (await response.json()) as typeof payload;
    } catch {
      payload = { error: "Cannot connect to the runner. Please try again." };
    }

    if (payload.error) {
      if (payload.error.toLowerCase().includes("session expired")) {
        window.location.href = "/";
        return;
      }
      setSubmitMessage(payload.error);
      setIsRunning(false);
      return;
    }

    if (payload.submitted) {
      setSubmissionStatus(payload.status ?? "pending");
      setSubmissionId(payload.submissionId ?? submissionId);
      setFeedbackMessages([]);
      setSubmitMessage("Submitted. Status is pending for admin review.");
      setShowNiceGif(true);
    } else {
      setSubmitMessage("Run completed.");
    }
    setIsRunning(false);
  }

  async function sendFeedback() {
    if (!submissionId || !feedbackBody.trim()) return;
    const body = feedbackBody.trim();
    setFeedbackBody("");
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, body }),
    });
    const payload = (await response.json()) as { message?: FeedbackMessage; error?: string };
    if (payload.message) setFeedbackMessages((current) => [...current, payload.message!]);
    if (payload.error) {
      if (payload.error.toLowerCase().includes("session expired")) {
        window.location.href = "/";
        return;
      }
      setSubmitMessage(payload.error);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-5">
        <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center justify-between">
            <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${difficultyBadgeClass(problem.difficulty)}`}>
              Level {problem.difficulty}/10
            </span>
            <span className="text-sm text-black/55 dark:text-white/55">{testCases.length} tests</span>
          </div>
          {problem.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="mb-4 max-h-72 w-full rounded-md object-cover" src={problem.imageUrl} />
          ) : (
            <div className="mb-4 flex h-36 items-center justify-center rounded-md border border-dashed border-black/15 text-black/40 dark:border-white/15 dark:text-white/35">
              <ImageIcon size={28} />
            </div>
          )}
          <p className="whitespace-pre-wrap text-sm leading-7 text-black/72 dark:text-white/72">{problem.prompt}</p>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <h2 className="mb-3 text-sm font-semibold">Visible Test Cases</h2>
          <div className="space-y-3">
            {visibleCases.map((test) => (
              <div className="rounded-md bg-black/[0.03] p-3 text-sm dark:bg-white/[0.06]" key={test.id}>
                <p className="font-medium">{test.name}</p>
                <p className="mt-2 text-xs text-black/55 dark:text-white/55">Input</p>
                <pre className="mt-1 overflow-auto rounded bg-white p-2 dark:bg-black/30">{test.input}</pre>
                <p className="mt-2 text-xs text-black/55 dark:text-white/55">Expected</p>
                <pre className="mt-1 overflow-auto rounded bg-white p-2 dark:bg-black/30">{test.expectedOutput}</pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold">Python IDE</p>
            <div className="flex flex-wrap gap-2">
              {submissionStatus && <SubmissionStatusBadge status={submissionStatus} />}
              <button className="inline-flex h-9 items-center gap-2 rounded-md border border-black/10 px-3 text-sm font-semibold dark:border-white/10" disabled={isRunning} onClick={() => runCode(false)} type="button">
                <Play size={16} /> Run
              </button>
              <button className="inline-flex h-9 items-center gap-2 rounded-md bg-mint px-3 text-sm font-semibold text-ink" disabled={isRunning} onClick={() => runCode(true)} type="button">
                <Send size={16} /> Submit
              </button>
            </div>
          </div>
          <CodeMirror
            basicSetup={{ lineNumbers: true, foldGutter: true }}
            extensions={[python()]}
            height="460px"
            onChange={setCode}
            theme="dark"
            value={code}
          />
        </div>

        {submitMessage && (
          <div className="rounded-md border border-mint/30 bg-mint/10 px-3 py-2 text-sm font-medium text-ink dark:text-paper">
            {submitMessage}
          </div>
        )}
        <SubmitCelebration show={showNiceGif} />

        <div className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          <h2 className="mb-3 text-sm font-semibold">Ask a Question</h2>
          <div className="mb-3 max-h-64 space-y-3 overflow-auto">
            {feedbackMessages.map((message) => (
              <div
                className={`rounded-md p-3 text-sm ${message.authorRole === "student" ? "bg-mint/10" : "bg-black/[0.04] dark:bg-white/[0.06]"}`}
                key={message.id}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase text-plum dark:text-mint">{message.authorRole}</span>
                  <span className="text-xs text-black/45 dark:text-white/45">{new Date(message.createdAt).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-wrap leading-6">{message.body}</p>
              </div>
            ))}
            {!feedbackMessages.length && (
              <p className="text-sm text-black/55 dark:text-white/55">
                {submissionId ? "No questions yet." : "Submit first to ask a question."}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="h-10 min-w-0 flex-1 rounded-md border border-black/10 bg-transparent px-3 text-sm outline-none focus:border-mint disabled:opacity-50 dark:border-white/15"
              disabled={!submissionId}
              onChange={(event) => setFeedbackBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void sendFeedback();
                }
              }}
              placeholder={submissionId ? "Ask about this submission..." : "Submit first to ask a question"}
              value={feedbackBody}
            />
            <button className="h-10 rounded-md bg-mint px-4 text-sm font-semibold text-ink disabled:opacity-50" disabled={!submissionId} onClick={sendFeedback} type="button">
              Send
            </button>
          </div>
        </div>

      </section>
    </div>
  );
}

function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const label = submissionStatusLabel(status);
  const className = submissionStatusBadgeClass(status);
  return <span className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold ${className}`}>{label}</span>;
}
