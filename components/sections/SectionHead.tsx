import type { ReactNode } from "react";
import { Reveal } from "@/components/home/Reveal";
import css from "./sections.module.css";

export function SectionHead({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede?: ReactNode }) {
  return (
    <Reveal className={css.head}>
      {eyebrow && <p className={css.eyebrow}>{eyebrow}</p>}
      <h2 className={css.h2}>{title}</h2>
      {lede && <p className={css.lead}>{lede}</p>}
    </Reveal>
  );
}
