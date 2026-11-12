"use client";
import { useEffect, useState } from "react";

// One persistent next step: shows after the hero, hides once the contact form is on screen.
export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let pastHero = false, atContact = false;
    const upd = () => setShow(pastHero && !atContact);
    const onScroll = () => { pastHero = scrollY > innerHeight * 0.7; upd(); };
    const target = document.getElementById("contact");
    const io = new IntersectionObserver(([e]) => { atContact = e.isIntersecting; upd(); });
    if (target) io.observe(target);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);
  return (
    <a className="mk-btn mk-btn-primary fx-sticky" href="/#contact" data-show={show} tabIndex={show ? 0 : -1} aria-hidden={!show}>
      Claim the December Sprint
    </a>
  );
}
