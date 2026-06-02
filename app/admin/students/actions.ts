"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeUsername, usernameToInternalEmail } from "@/lib/auth-identity";

export async function createStudent(formData: FormData) {
  await requireRole("admin");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const email = usernameToInternalEmail(username);
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || password.length < 6) {
    redirect("/admin/students/new?error=invalid");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      username,
    },
  });

  if (error || !data.user) {
    redirect("/admin/students/new?error=create-user");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    role: "student",
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    redirect("/admin/students/new?error=profile");
  }

  redirect("/admin/students/new?created=1");
}

export async function removeStudentAssignment(formData: FormData) {
  await requireRole("admin");
  const supabase = createAdminClient();
  const studentId = String(formData.get("studentId") ?? "");
  const problemId = String(formData.get("problemId") ?? "");

  if (!studentId || !problemId) return;

  await supabase.from("problem_assignments").delete().eq("student_id", studentId).eq("problem_id", problemId);
  revalidatePath(`/admin/students/${studentId}`);
}

export async function deleteStudent(formData: FormData) {
  await requireRole("admin");
  const supabase = createAdminClient();
  const studentId = String(formData.get("studentId") ?? "");

  if (!studentId) return;

  await supabase.auth.admin.deleteUser(studentId);
  await supabase.from("profiles").delete().eq("id", studentId).eq("role", "student");
  revalidatePath("/admin/students");
}
