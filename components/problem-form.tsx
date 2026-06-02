"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createProblem } from "@/app/admin/problems/actions";

type DraftTest = {
  name: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
};

const initialTests: DraftTest[] = [
  { name: "Sample 1", input: "", expectedOutput: "", isHidden: false },
  { name: "Hidden edge", input: "", expectedOutput: "", isHidden: true },
];

export function ProblemForm({
  action = createProblem,
  initial,
  submitLabel = "Save Problem",
}: {
  action?: (formData: FormData) => void | Promise<void>;
  initial?: {
    id?: string;
    title: string;
    slug: string;
    prompt: string;
    imageUrl: string;
    difficulty: number;
    starterCode: string;
    published: boolean;
    tests: DraftTest[];
  };
  submitLabel?: string;
}) {
  const [tests, setTests] = useState<DraftTest[]>(initial?.tests.length ? initial.tests : initialTests);
  const json = useMemo(() => JSON.stringify(tests), [tests]);

  function updateTest(index: number, patch: Partial<DraftTest>) {
    setTests((current) => current.map((test, testIndex) => (testIndex === index ? { ...test, ...patch } : test)));
  }

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      {initial?.id && <input name="problemId" type="hidden" value={initial.id} />}
      <input name="testCases" type="hidden" value={json} />
      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <label className="block text-sm font-medium">
          Title
          <input className="mt-2 h-11 w-full rounded-md border border-black/10 bg-transparent px-3 outline-none focus:border-mint dark:border-white/15" defaultValue={initial?.title} name="title" required />
        </label>
        <label className="block text-sm font-medium">
          Slug
          <input className="mt-2 h-11 w-full rounded-md border border-black/10 bg-transparent px-3 outline-none focus:border-mint dark:border-white/15" defaultValue={initial?.slug} name="slug" placeholder="sum-two-numbers" />
        </label>
        <label className="block text-sm font-medium">
          Image URL
          <input className="mt-2 h-11 w-full rounded-md border border-black/10 bg-transparent px-3 outline-none focus:border-mint dark:border-white/15" defaultValue={initial?.imageUrl} name="imageUrl" />
        </label>
        <label className="block text-sm font-medium">
          Prompt
          <textarea className="mt-2 min-h-44 w-full rounded-md border border-black/10 bg-transparent p-3 outline-none focus:border-mint dark:border-white/15" defaultValue={initial?.prompt} name="prompt" required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Difficulty
            <input className="mt-2 h-11 w-full rounded-md border border-black/10 bg-transparent px-3 outline-none focus:border-mint dark:border-white/15" defaultValue={initial?.difficulty ?? 1} max={10} min={1} name="difficulty" type="number" />
          </label>
          <label className="flex items-end gap-2 text-sm font-medium">
            <input className="h-5 w-5 accent-mint" defaultChecked={initial?.published ?? true} name="published" type="checkbox" />
            Published
          </label>
        </div>
        <label className="block text-sm font-medium">
          Starter Code
          <textarea className="mt-2 min-h-44 w-full rounded-md border border-black/10 bg-[#202020] p-3 font-mono text-sm text-paper outline-none focus:border-mint" name="starterCode" defaultValue={initial?.starterCode ?? "# write your solution here\n"} />
        </label>
      </section>

      <section className="space-y-4 rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Test Cases</h2>
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-black/10 px-3 text-sm font-semibold dark:border-white/10" onClick={() => setTests((current) => [...current, { name: `Test ${current.length + 1}`, input: "", expectedOutput: "", isHidden: false }])} type="button">
            <Plus size={16} /> Add
          </button>
        </div>
        {tests.map((test, index) => (
          <div className="rounded-md border border-black/10 p-3 dark:border-white/10" key={index}>
            <div className="mb-3 flex items-center gap-2">
              <input className="h-10 min-w-0 flex-1 rounded-md border border-black/10 bg-transparent px-3 text-sm outline-none focus:border-mint dark:border-white/15" onChange={(event) => updateTest(index, { name: event.target.value })} value={test.name} />
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 dark:border-white/10" onClick={() => setTests((current) => current.filter((_, testIndex) => testIndex !== index))} title="Remove test" type="button">
                <Trash2 size={16} />
              </button>
            </div>
            <textarea className="mb-2 min-h-20 w-full rounded-md border border-black/10 bg-transparent p-2 font-mono text-sm outline-none focus:border-mint dark:border-white/15" onChange={(event) => updateTest(index, { input: event.target.value })} placeholder="Input" value={test.input} />
            <textarea className="min-h-20 w-full rounded-md border border-black/10 bg-transparent p-2 font-mono text-sm outline-none focus:border-mint dark:border-white/15" onChange={(event) => updateTest(index, { expectedOutput: event.target.value })} placeholder="Expected output" value={test.expectedOutput} />
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input checked={test.isHidden} className="h-4 w-4 accent-mint" onChange={(event) => updateTest(index, { isHidden: event.target.checked })} type="checkbox" />
              Hidden from student
            </label>
          </div>
        ))}
        <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-mint text-sm font-semibold text-ink" type="submit">
          <Save size={17} /> {submitLabel}
        </button>
      </section>
    </form>
  );
}
