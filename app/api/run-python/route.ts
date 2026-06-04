import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { clearSessionStarted, isSessionExpired } from "@/lib/session-timeout";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { RunResult } from "@/lib/types";

export const runtime = "nodejs";

const testCaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean(),
  orderIndex: z.number(),
});

const requestSchema = z.object({
  problemId: z.string(),
  code: z.string().min(1).max(20000),
  testCases: z.array(testCaseSchema).max(50).default([]),
  submit: z.boolean().default(false),
  note: z.string().max(2000).optional(),
});

async function runPython(code: string, input: string) {
  const dir = await mkdtemp(join(tmpdir(), "evening-playground-"));
  const file = join(dir, "solution.py");
  const started = Date.now();

  try {
    await writeFile(file, code, "utf8");

    return await new Promise<{ stdout: string; stderr: string; durationMs: number; timedOut: boolean }>((resolve) => {
      const child = spawn(process.env.PYTHON_BIN || "python", [file], {
        cwd: dir,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";
      const timer = setTimeout(() => {
        child.kill();
        resolve({ stdout, stderr: "Execution timed out after 2 seconds.", durationMs: Date.now() - started, timedOut: true });
      }, 2000);

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.on("close", () => {
        clearTimeout(timer);
        resolve({ stdout, stderr, durationMs: Date.now() - started, timedOut: false });
      });

      child.stdin.write(input);
      child.stdin.end();
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { code, testCases, problemId, submit, note } = parsed.data;
  const results: RunResult[] = [];
  let createdSubmissionId: string | undefined;

  for (const testCase of [...testCases].sort((a, b) => a.orderIndex - b.orderIndex)) {
    const run = await runPython(code, testCase.input);
    const output = normalizeOutput(run.stdout);
    const expected = normalizeOutput(testCase.expectedOutput);
    const passed = !run.stderr && output === expected;

    results.push({
      testCaseId: testCase.id,
      name: testCase.name,
      passed,
      hidden: testCase.isHidden,
      output: testCase.isHidden ? undefined : output,
      expectedOutput: testCase.isHidden ? undefined : expected,
      error: testCase.isHidden ? undefined : run.stderr || undefined,
      durationMs: run.durationMs,
    });
  }

  if (submit && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const sessionClient = await createClient();
    const supabase = createAdminClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in again before submitting.", results }, { status: 401 });
    }
    if (await isSessionExpired()) {
      await sessionClient.auth.signOut();
      await clearSessionStarted();
      return NextResponse.json({ error: "Session expired. Please log in again.", results }, { status: 401 });
    }

    const { data: submission, error } = await supabase
      .from("submissions")
      .insert({
        problem_id: problemId,
        student_id: user?.id ?? null,
        code,
        note: note ?? "",
        passed_count: results.filter((result) => result.passed).length,
        total_count: results.length,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      const migrationHint = error.message.includes("invalid input value for enum")
        ? "Submission status migration has not been run yet. Please run supabase/status-migration.sql in Supabase SQL Editor."
        : error.message;
      return NextResponse.json({ error: migrationHint, results }, { status: 500 });
    }

    createdSubmissionId = submission.id;

    const { data: admins } = await supabase.from("profiles").select("id").eq("role", "admin");
    if (admins?.length) {
      await supabase.from("notifications").insert(
        admins.map((admin) => ({
          user_id: admin.id,
          title: "Submission pending review",
          body: `${results.filter((result) => result.passed).length}/${results.length} test cases passed. Waiting for admin review.`,
          submission_id: createdSubmissionId,
        })),
      );
    }
  }

  return NextResponse.json({ results, submitted: submit, status: submit ? "pending" : undefined, submissionId: createdSubmissionId });
}
