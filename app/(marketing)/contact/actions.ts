"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/mail";

// Personal inboxes that also receive every contact form submission.
const INQUIRY_RECIPIENTS = ["tommyli8321@gmail.com", "curtislee2026@gmail.com"];

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

  // Let the team know: every address below gets its own copy. A mail failure never blocks the visitor's confirmation.
  const recipients = Array.from(
    new Set([process.env.ALERT_EMAIL, ...INQUIRY_RECIPIENTS].filter((r): r is string => !!r).map((r) => r.toLowerCase())),
  );
  const subject = "New IvyIn inquiry";
  const text = `From: ${name} <${email}>\n\n${message}\n\nReply in the admin Inquiries page.`;
  await Promise.all(recipients.map((to) => sendEmail({ to, subject, text })));

  redirect("/contact?sent=1");
}
