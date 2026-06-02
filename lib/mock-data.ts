import type { Problem, TestCase } from "@/lib/types";

export const demoProblems: Problem[] = [
  {
    id: "demo-sum-two",
    title: "Sum Two Numbers",
    slug: "sum-two-numbers",
    prompt:
      "เขียนโปรแกรม Python รับจำนวนเต็ม 2 ตัวจาก stdin แล้วแสดงผลรวมออกมา 1 บรรทัด",
    imageUrl: null,
    difficulty: 2,
    starterCode: "a = int(input())\nb = int(input())\n# write your code here\n",
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-even",
    title: "Even or Odd",
    slug: "even-or-odd",
    prompt:
      "รับจำนวนเต็ม 1 ตัว แล้วพิมพ์ Even ถ้าเป็นเลขคู่ หรือ Odd ถ้าเป็นเลขคี่",
    imageUrl: null,
    difficulty: 3,
    starterCode: "n = int(input())\n# write your code here\n",
    published: true,
    createdAt: new Date().toISOString(),
  },
];

export const demoTestCases: Record<string, TestCase[]> = {
  "demo-sum-two": [
    { id: "sum-1", name: "Small positive", input: "2\n3\n", expectedOutput: "5", isHidden: false, orderIndex: 1 },
    { id: "sum-2", name: "Negative numbers", input: "-4\n10\n", expectedOutput: "6", isHidden: false, orderIndex: 2 },
    { id: "sum-3", name: "Hidden edge", input: "0\n0\n", expectedOutput: "0", isHidden: true, orderIndex: 3 },
  ],
  "demo-even": [
    { id: "even-1", name: "Even", input: "8\n", expectedOutput: "Even", isHidden: false, orderIndex: 1 },
    { id: "even-2", name: "Odd", input: "11\n", expectedOutput: "Odd", isHidden: false, orderIndex: 2 },
  ],
};
