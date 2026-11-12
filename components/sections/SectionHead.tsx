import type { ReactNode } from "react";
import { Reveal } from "@/components/home/Reveal";
import { Words } from "@/components/home/Words";
import css from "./sections.module.css";

export function SectionHead({ eyebrow, title }: { eyebrow?: string; title: string; lede?: ReactNode }) {
  return (
    <Reveal className={css.head}>
      {eyebrow && <p className={css.eyebrow}>{eyebrow}</p>}
      <h2 className={css.h2}><Words text={title} accent /></h2>
    </Reveal>
  );
}
