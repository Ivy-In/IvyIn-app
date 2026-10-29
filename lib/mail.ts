import { createAdminClient } from "@/lib/supabase/admin";

// Sends email through Resend when RESEND_API_KEY and MAIL_FROM are set.
// Returns false, without throwing, when email isn't configured.
//
// Every message ends with the IvyIn signature (logo, tagline, website, social icons).
// The tagline and the three social links are edited in the admin Content page:
// type "setting", slug "email-signature". Optional `signoff` (for example "IvyIn Hiring Team")
// is printed directly above the logo.

const PRIMARY = "#114230";
const SECONDARY = "#55786a";
const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ivy-in.com").replace(/\/+$/, "");

type Signature = { tagline: string; website: string; instagram: string; linkedin: string; whatsapp: string };

const DEFAULTS: Signature = {
  tagline: "America's Premier College Consulting Group",
  website: BASE,
  instagram: "https://www.instagram.com/",
  linkedin: "https://www.linkedin.com/",
  whatsapp: "https://wa.me/",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Only https links go into the signature, so edited content cannot inject anything else.
function safeUrl(v: unknown, fallback: string): string {
  return typeof v === "string" && /^https:\/\/[^\s"<>]+$/i.test(v.trim()) ? v.trim() : fallback;
}

async function loadSignature(): Promise<Signature> {
  try {
    const { data } = await createAdminClient()
      .from("cms_entries")
      .select("data, published")
      .eq("collection", "setting")
      .eq("slug", "email-signature")
      .maybeSingle();
    const d = data && data.published && typeof data.data === "object" && data.data ? (data.data as Record<string, unknown>) : {};
    return {
      tagline: typeof d.tagline === "string" && d.tagline.trim() ? d.tagline.trim().slice(0, 120) : DEFAULTS.tagline,
      website: safeUrl(d.website, DEFAULTS.website),
      instagram: safeUrl(d.instagram, DEFAULTS.instagram),
      linkedin: safeUrl(d.linkedin, DEFAULTS.linkedin),
      whatsapp: safeUrl(d.whatsapp, DEFAULTS.whatsapp),
    };
  } catch {
    return DEFAULTS;
  }
}

export function buildEmail(text: string, sig: Signature, signoff?: string) {
  const font = "font-family:Arial,Helvetica,sans-serif";
  const paragraphs = text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;${font};font-size:15px;line-height:1.6;color:#1b2b24">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const icon = (href: string, name: string, label: string) =>
    `<a href="${esc(href)}" style="text-decoration:none;display:inline-block;margin-right:14px"><img src="${BASE}/brand/email-${name}.png" width="26" height="26" alt="${label}" style="display:block;border:0"></a>`;

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#ffffff">
<div style="max-width:560px">
${paragraphs}
${signoff ? `<p style="margin:8px 0 18px;${font};font-size:15px;font-weight:bold;color:${PRIMARY}">${esc(signoff)}</p>` : ""}
<img src="${BASE}/brand/logo-header.jpg" width="190" alt="IvyIn" style="display:block;border:0;height:auto">
<p style="margin:10px 0 0;${font};font-size:12px;line-height:1.4;color:${SECONDARY}">${esc(sig.tagline)}</p>
<p style="margin:34px 0 18px;${font};font-size:14px"><a href="${esc(sig.website)}" style="color:${PRIMARY};text-decoration:underline">www.Ivy-In.com</a></p>
<div>${icon(sig.instagram, "instagram", "Instagram")}${icon(sig.linkedin, "linkedin", "LinkedIn")}${icon(sig.whatsapp, "whatsapp", "WhatsApp")}</div>
</div></body></html>`;

  const plain = `${text.trim()}\n\n${signoff ? `${signoff}\n` : ""}IvyIn\n${sig.tagline}\n\n\nwww.Ivy-In.com\nInstagram: ${sig.instagram}\nLinkedIn: ${sig.linkedin}\nWhatsApp: ${sig.whatsapp}\n`;
  return { html, plain };
}

export async function sendEmail(opts: { to: string; subject: string; text: string; signoff?: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from || !opts.to) return false;
  try {
    const { html, plain } = buildEmail(opts.text, await loadSignature(), opts.signoff);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, text: plain, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
