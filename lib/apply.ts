// Shared by the application form (browser) and its server action, so both count words the same way.
export const GRAD_YEARS = [2026, 2027, 2028, 2029, 2030];

export const LONG_QUESTIONS = {
  experience: {
    max: 250,
    label: "Have you had any experience in college consulting or other client-facing positions?",
    hint: "If so, describe your responsibilities in these roles. If not, describe the traits you have that make you likely to succeed as a consultant.",
  },
  why_accepted: {
    max: 150,
    label: "Why do you think you were accepted into your current university?",
    hint: "",
  },
  action_plan: {
    max: 200,
    label: "What would your action plan be for a high school freshman who has trouble choosing between studying business and engineering?",
    hint: "",
  },
} as const;

export type LongKey = keyof typeof LONG_QUESTIONS;

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
