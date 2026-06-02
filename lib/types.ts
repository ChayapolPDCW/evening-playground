export type Role = "admin" | "student";
export type SubmissionStatus = "pending" | "accepted" | "rejected";

export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type TestCase = {
  id: string;
  name: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  orderIndex: number;
};

export type Problem = {
  id: string;
  title: string;
  slug: string;
  prompt: string;
  imageUrl: string | null;
  difficulty: Difficulty;
  starterCode: string;
  published: boolean;
  createdAt: string;
};

export type RunResult = {
  testCaseId: string;
  name: string;
  passed: boolean;
  hidden: boolean;
  output?: string;
  expectedOutput?: string;
  error?: string;
  durationMs: number;
};

export type LatestSubmission = {
  id: string;
  problemId: string;
  status: SubmissionStatus;
  passedCount: number;
  totalCount: number;
  createdAt: string;
};

export type FeedbackMessage = {
  id: string;
  body: string;
  authorRole: Role;
  createdAt: string;
};
