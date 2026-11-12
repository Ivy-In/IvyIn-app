// University wordmarks live in /public/logos, already tinted to the porcelain color.
export const LOGOS: { slug: string; name: string }[] = [
  ["mit", "MIT"], ["princeton", "Princeton"], ["harvard", "Harvard"], ["yale", "Yale"], ["caltech", "Caltech"], ["stanford", "Stanford"],
  ["penn", "Penn"], ["duke", "Duke"], ["jhu", "Johns Hopkins"], ["northwestern", "Northwestern"], ["uchicago", "UChicago"],
  ["columbia", "Columbia"], ["dartmouth", "Dartmouth"], ["cmu", "Carnegie Mellon"], ["cornell", "Cornell"], ["brown", "Brown"],
  ["rice", "Rice"], ["vanderbilt", "Vanderbilt"], ["washu", "WashU"], ["berkeley", "UC Berkeley"], ["ucla", "UCLA"],
  ["notre-dame", "Notre Dame"], ["emory", "Emory"], ["georgetown", "Georgetown"], ["michigan", "Michigan"], ["virginia", "UVA"],
  ["unc", "UNC Chapel Hill"], ["usc", "USC"], ["georgia-tech", "Georgia Tech"], ["ucsd", "UC San Diego"], ["boston-college", "Boston College"],
  ["nyu", "NYU"], ["tufts", "Tufts"], ["boston-university", "Boston University"], ["ucdavis", "UC Davis"], ["wake-forest", "Wake Forest"],
  ["uci", "UC Irvine"], ["florida", "Florida"], ["illinois", "Illinois"], ["texas", "UT Austin"], ["wisconsin", "Wisconsin"],
  ["waterloo", "Waterloo"], ["ubc", "UBC"], ["toronto", "Toronto"], ["mcgill", "McGill"], ["western", "Western"], ["ivey", "Ivey"],
].map(([slug, name]) => ({ slug, name }));

const BY_SCHOOL: Record<string, string> = {
  Columbia: "columbia", Cornell: "cornell", Dartmouth: "dartmouth", Michigan: "michigan", NYU: "nyu", Stanford: "stanford",
  Tufts: "tufts", "UC Berkeley": "berkeley", "UNC Chapel Hill": "unc", USC: "usc", Waterloo: "waterloo",
};

// The logo for a mentor's school, or null when we don't have one.
export const logoFor = (school: string): { src: string; name: string } | null => {
  const slug = BY_SCHOOL[school];
  return slug ? { src: `/logos/${slug}.png`, name: school } : null;
};
