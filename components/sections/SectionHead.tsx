import type { ReactNode } from "react";
import { Reveal } from "@/components/home/Reveal";
import { Words } from "@/components/home/Words";
import css from "./sections.module.css";

export function SectionHead({ eyebrow, title, wide }: { eyebrow?: string; title: string; lede?: ReactNode; wide?: boolean }) {
  return (
    <Reveal className={css.head}>
      {eyebrow && <p className={css.eyebrow}>{eyebrow}</p>}
      <h2 className={wide ? `${css.h2} ${css.h2wide}` : css.h2}><Words text={title} accent /></h2>
    </Reveal>
  );
}
