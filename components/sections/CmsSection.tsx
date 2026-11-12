import Link from "next/link";
import { getPage, type PageContent } from "@/lib/content";
import { anchorHref } from "@/lib/anchors";
import { Reveal } from "@/components/home/Reveal";
import { Words } from "@/components/home/Words";
import { PricingToggle } from "./PricingToggle";
import { titleCase } from "@/lib/titlecase";
import css from "./sections.module.css";

type Tone = "glow" | "deep" | "flat";
type Card = { title: string; body: string };

const money = (s: string) => s.match(/\$[\d,]+(?:\.\d+)?/)?.[0];
const amount = (p: string) => Number(p.replace(/[^\d.]/g, ""));

// Finds the six-month and annual payment cards and turns them into one card with a switch.
// If the content does not look like that, every card is shown as written.
function withPricing(cards: Card[]): { items: (Card | { pricing: { title: string; plans: [{ label: string; price: string; per: string }, { label: string; price: string; per: string }]; saving?: string } })[] } {
  const six = cards.findIndex((c) => /(six|6)[\s-]*month/i.test(c.title) && money(c.body));
  const yr = cards.findIndex((c) => /(annual|year|12[\s-]*month)/i.test(c.title) && money(c.body));
  if (six < 0 || yr < 0 || six === yr) return { items: cards };
  const p6 = money(cards[six].body)!;
  const p12 = money(cards[yr].body)!;
  const diff = amount(p6) * 2 - amount(p12);
  const pricing = {
    title: "Choose Your Plan",
    plans: [
      { label: "6 Months", price: p6, per: "for six months" },
      { label: "12 Months", price: p12, per: "for a full year" },
    ] as [{ label: string; price: string; per: string }, { label: string; price: string; per: string }],
    saving: diff > 0 ? `Saves $${diff.toLocaleString("en-US")} compared with two six-month plans` : undefined,
  };
  const items: (Card | { pricing: typeof pricing })[] = [];
  cards.forEach((c, idx) => {
    if (idx === six) items.push({ pricing });
    else if (idx !== yr) items.push(c);
  });
  return { items };
}

// A section whose words come from the CMS (About, How It Works, Services), so admins can still edit them.
export async function CmsSection({
  id, slug, eyebrow, tone = "flat", children,
}: { id: string; slug: string; eyebrow: string; tone?: Tone; children?: React.ReactNode }) {
  return <CmsView id={id} eyebrow={eyebrow} tone={tone} c={await getPage(slug)}>{children}</CmsView>;
}

export function CmsView({
  id, c, eyebrow, tone = "flat", children,
}: { id: string; c: PageContent; eyebrow: string; tone?: Tone; children?: React.ReactNode }) {
  const items = withPricing(c.sections).items;
  return (
    <section id={id} className={`${css.band} ${css[tone]} ${css.grain}`} aria-labelledby={`${id}-h`}>
      <div className={css.wrap}>
        <Reveal className={css.head}>
          <p className={css.eyebrow}>{c.eyebrow ?? eyebrow}</p>
          <h2 className={css.h2} id={`${id}-h`}><Words text={titleCase(c.headline)} accent /></h2>
        </Reveal>

        {items.length > 0 && (
          <div className={css.cards} data-n3={items.length % 3} data-n2={items.length % 2} data-steps={id === "how-it-works" ? "" : undefined}>
            {items.map((it, i) => (
              <Reveal key={i} delay={(i % 3) * 110} from="tilt">
                {"pricing" in it ? (
                  <PricingToggle {...it.pricing} />
                ) : (
                  <div className={css.card} data-glow="">
                    <h3 className={css.cardTitle}>{titleCase(it.title)}</h3>
                    <p>{it.body}</p>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        )}

        {(c.primary || c.secondary) && (
          <div className={css.cta}>
            {c.primary && <Link className="mk-btn mk-btn-primary" href={anchorHref(c.primary.href)}>{titleCase(c.primary.label)}</Link>}
            {c.secondary && <Link className="mk-btn mk-btn-ghost" href={anchorHref(c.secondary.href)}>{titleCase(c.secondary.label)}</Link>}
          </div>
        )}

        {children}

      </div>
    </section>
  );
}
