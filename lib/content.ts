import { createClient } from "@/lib/supabase/server";

// Public marketing copy lives in the cms_entries table, so admins can edit it
// without a developer. These defaults show only if the database can't be reached.

export type Cta = { label: string; href: string };
export type Section = { title: string; body: string };
export type PageContent = {
  eyebrow?: string;
  headline: string;
  lede?: string;
  primary?: Cta;
  secondary?: Cta;
  sections: Section[];
  closing?: { headline: string; body: string; cta: Cta };
};
export type Faq = { question: string; answer: string };

const FALLBACK: PageContent = {
  headline: "IvyIn",
  lede: "This page is temporarily unavailable. Please check back soon.",
  sections: [],
};

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

// Only same-site paths and https links are allowed, so content can't inject javascript: links.
function cta(v: unknown): Cta | undefined {
  if (!isObj(v)) return undefined;
  const label = str(v.label);
  const href = str(v.href);
  if (!label || !href) return undefined;
  const safe = (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://");
  return safe ? { label, href } : undefined;
}

function toPage(d: unknown): PageContent | null {
  if (!isObj(d)) return null;
  const headline = str(d.headline);
  if (!headline) return null;

  const sections: Section[] = [];
  if (Array.isArray(d.sections)) {
    for (const s of d.sections) {
      if (isObj(s) && str(s.title) && str(s.body)) {
        sections.push({ title: s.title as string, body: s.body as string });
      }
    }
  }

  let closing: PageContent["closing"];
  if (isObj(d.closing) && str(d.closing.headline) && str(d.closing.body) && cta(d.closing.cta)) {
    closing = {
      headline: d.closing.headline as string,
      body: d.closing.body as string,
      cta: cta(d.closing.cta)!,
    };
  }

  return {
    eyebrow: str(d.eyebrow),
    headline,
    lede: str(d.lede),
    primary: cta(d.primary),
    secondary: cta(d.secondary),
    sections,
    closing,
  };
}

export async function getPage(slug: string): Promise<PageContent> {
  try {
    const supabase = await createClient();
    // Row-level security returns only published rows to visitors.
    const { data, error } = await supabase
      .from("cms_entries")
      .select("data")
      .eq("collection", "page")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return FALLBACK;
    return toPage(data.data) ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export async function getFaqs(): Promise<Faq[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_entries")
      .select("data, sort_order")
      .eq("collection", "faq")
      .order("sort_order");
    if (error || !data) return [];
    const faqs: Faq[] = [];
    for (const row of data) {
      if (isObj(row.data) && str(row.data.question) && str(row.data.answer)) {
        faqs.push({ question: row.data.question as string, answer: row.data.answer as string });
      }
    }
    return faqs;
  } catch {
    return [];
  }
}
