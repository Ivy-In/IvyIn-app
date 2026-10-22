"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/mail";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendInquiry(formData: FormData) {
  // Honeypot: a hidden field real visitors never fill in. Bots that do get a fake success.
  if (String(formData.get("website") ?? "") !== "") redirect("/contact?sent=1");

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);

  if (!name || !EMAIL.test(email) || message.length < 10) redirect("/contact?error=invalid");

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({ name, email, message });
  if (error) redirect("/contact?error=save");

  // Let the team know. A mail failure never blocks the visitor's confirmation.
  if (process.env.ALERT_EMAIL) {
    await sendEmail({
      to: process.env.ALERT_EMAIL,
      subject: "New IvyIn inquiry",
      text: `From: ${name} <${email}>\n\n${message}\n\nReply in the admin Inquiries page.`,
    });
  }

  redirect("/contact?sent=1");
}
