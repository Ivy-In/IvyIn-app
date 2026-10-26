"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PASS_COOKIE, getSignupPass } from "@/lib/signup-pass";

// The visitor types the code that staff gave them after payment.
export async function enterCode(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().slice(0, 12);
  const supabase = await createClient();
  const { data: token } = await supabase.rpc("redeem_signup_code", { p_code: code });
  if (!token) redirect("/signup?error=code");

  const jar = await cookies();
  jar.set(PASS_COOKIE, token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  redirect("/signup");
}

export async function signUp(formData: FormData) {
  const pass = await getSignupPass();
  if (!pass) redirect("/signup?error=pass");

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!fullName || !email || !password) redirect("/signup?error=missing");
  if (password.length < 10) redirect("/signup?error=short");
  if (password !== confirm) redirect("/signup?error=mismatch");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) redirect("/signup?error=exists");

  // The pass works for one account only.
  await supabase.rpc("consume_signup_pass", { p_token: pass });
  const jar = await cookies();
  jar.delete(PASS_COOKIE);

  redirect("/signup?sent=1");
}
