"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GRAD_YEARS, LONG_QUESTIONS, countWords, type LongKey } from "@/lib/apply";

export type ApplyState = { error?: string; values?: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitApplication(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  // Honeypot: a hidden field real applicants never fill in. Bots that do get a fake success.
  if (String(formData.get("website") ?? "") !== "") redirect("/apply/thanks");

  const get = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max);
  const values: Record<string, string> = {
    first_name: get("first_name", 80),
    last_name: get("last_name", 80),
    phone: get("phone", 30),
    email: get("email", 200),
    university: get("university", 150),
    grad_year: get("grad_year", 4),
    major_minor: get("major_minor", 200),
    hometown: get("hometown", 120),
    experience: get("experience", 4000),
    why_accepted: get("why_accepted", 4000),
    action_plan: get("action_plan", 4000),
    expected_pay: get("expected_pay", 100),
    weekly_hours: get("weekly_hours", 3),
  };
  const fail = (error: string): ApplyState => ({ error, values });

  for (const [k, v] of Object.entries(values)) {
    if (!v) return fail("Please answer every question.");
  }
  if (!EMAIL.test(values.email)) return fail("Enter a valid email address, such as name@example.com.");
  const digits = values.phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return fail("Enter a valid phone number, with area code.");
  const year = Number(values.grad_year);
  if (!GRAD_YEARS.includes(year)) return fail("Choose a graduation year from 2026 to 2030.");
  const hours = Number(values.weekly_hours);
  if (!Number.isInteger(hours) || hours < 1 || hours > 80) return fail("Enter whole hours per week, from 1 to 80.");

  for (const key of Object.keys(LONG_QUESTIONS) as LongKey[]) {
    const q = LONG_QUESTIONS[key];
    const words = countWords(values[key]);
    if (words > q.max) return fail(`An answer is ${words - q.max} words over its ${q.max}-word limit. Shorten it and submit again.`);
    if (values[key].length > (key === "why_accepted" ? 1500 : key === "experience" ? 2500 : 2000)) {
      return fail("One of your answers is too long. Shorten it and submit again.");
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("consultant_applications").insert({
    first_name: values.first_name,
    last_name: values.last_name,
    phone: values.phone,
    email: values.email,
    university: values.university,
    grad_year: year,
    major_minor: values.major_minor,
    hometown: values.hometown,
    experience: values.experience,
    why_accepted: values.why_accepted,
    action_plan: values.action_plan,
    expected_pay: values.expected_pay,
    weekly_hours: hours,
  });
  if (error) return fail("We could not save your application. Your answers are still here. Try again in a moment.");

  redirect("/apply/thanks");
}
