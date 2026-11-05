// Background clips for the home hero, played one after another.
// Put each file in /public/hero/ (MP4, H.264, no audio, about 1280px wide, 8 to 15 seconds, under 4 MB).
// Missing files are skipped, so you can add or remove clips without breaking the page.
export const HERO_VIDEOS: { src: string; school: string }[] = [
  { src: "/hero/cornell.mp4", school: "Cornell University" },
  { src: "/hero/yale.mp4", school: "Yale University" },
  { src: "/hero/stanford.mp4", school: "Stanford University" },
  { src: "/hero/duke.mp4", school: "Duke University" },
  { src: "/hero/upenn.mp4", school: "University of Pennsylvania" },
  { src: "/hero/northwestern.mp4", school: "Northwestern University" },
];
