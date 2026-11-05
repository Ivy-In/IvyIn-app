// Latest college and admissions headlines from public RSS feeds, refreshed once a day.
// Only the headline, source, date and link are used (no article text or images), and every link goes to the publisher.
// To add or remove a paper, edit FEEDS. A feed that is down or has moved is skipped without breaking the page.
export type NewsItem = { title: string; url: string; source: string; short: string; date: string; image?: string; weight: number };

type Feed = { source: string; short: string; url: string; filter: boolean; weight: number };

const FEEDS: Feed[] = [
  { source: "The New York Times", short: "NYT", weight: 3, url: "https://rss.nytimes.com/services/xml/rss/nyt/Education.xml", filter: true },
  { source: "The Washington Post", short: "WaPo", weight: 3, url: "https://feeds.washingtonpost.com/rss/national", filter: true },
  { source: "Los Angeles Times", short: "LAT", weight: 2, url: "https://www.latimes.com/california/rss2.0.xml", filter: true },
  { source: "The Wall Street Journal", short: "WSJ", weight: 3, url: "https://feeds.content.dowjones.io/public/rss/RSSUSnews", filter: true },
  { source: "Inside Higher Ed", short: "IHE", weight: 1, url: "https://www.insidehighered.com/rss.xml", filter: true },
  { source: "Rutgers Today", short: "RU", weight: 1, url: "https://www.rutgers.edu/news/feed", filter: true },
];

// Only college and admissions stories are kept, from every feed.
// Capitalized test names (SAT, ACT, FAFSA, AP) must match exactly so "Final Act" does not count.
const TESTS = /\b(SAT|ACT|FAFSA|AP)\b/;
const SCHOOLS = "Harvard|Yale|Princeton|Columbia|Cornell|Brown University|Dartmouth|Penn|Stanford|MIT|Duke|Northwestern|Georgetown|Rutgers|Johns Hopkins|Vanderbilt|Caltech|UCLA|Berkeley|Michigan|NYU";
const STRONG = new RegExp(`\\b(admission|admissions|admit|admits|admitted|applicants?|financial aid|Common App|early decision|early action|Ivy League|tuition|scholarships?|enrollment|student loans?|university|universities|undergraduates?|freshman|freshmen|${SCHOOLS})\\b`, "i");
const GENERAL = /\b(college|colleges|campus|campuses|higher education|students?|degree|degrees|graduates?|commencement|professor|professors|dorms?|sorority|fraternity|athletes?)\b/i;
// Election and politics headlines are dropped unless a college-specific term is also in the headline.
const POLITICS = /\b(trump|biden|harris|democrat|democrats|democratic|republican|republicans|election|elections|vote|voter|voters|voting|ballot|senate|senator|congress|governor|mayor|candidate|candidates|poll|polls|midterm|midterms|electoral|returns|opinion)\b/i;

export function isCollegeStory(title: string): boolean {
  const strong = TESTS.test(title) || STRONG.test(title);
  const general = GENERAL.test(title);
  if (!strong && !general) return false;
  if (POLITICS.test(title) && !strong) return false;
  return true;
}
const MAX_AGE_DAYS = 45;
const DAY = 86400;

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const tag = (block: string, name: string) => {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
};

// The picture a feed supplies for a story (media tags, an image enclosure, or an <img> in the summary).
function imageOf(block: string): string | undefined {
  const raw = block.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const found =
    raw.match(/<media:content[^>]*url=["']([^"']+)["']/i)?.[1] ??
    raw.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i)?.[1] ??
    raw.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i)?.[1] ??
    raw.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  const clean = found?.replace(/&amp;/g, "&");
  return clean && /^https:\/\//i.test(clean) ? clean : undefined;
}

// Reads RSS (item) and Atom (entry) feeds.
export function parseFeed(xml: string, feed: Pick<Feed, "source" | "short" | "weight">): NewsItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const out: NewsItem[] = [];
  for (const b of blocks) {
    const title = tag(b, "title");
    let url = tag(b, "link");
    if (!url) url = b.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ?? "";
    const when = tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date");
    const t = Date.parse(when);
    if (!title || !/^https?:\/\//i.test(url) || Number.isNaN(t)) continue;
    out.push({ title, url, source: feed.source, short: feed.short, weight: feed.weight, date: new Date(t).toISOString(), image: imageOf(b) });
  }
  return out;
}

async function load(feed: Feed): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      next: { revalidate: DAY },
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": "IvyInBot/1.0 (+https://ivy-in.com)", accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) return [];
    const items = parseFeed(await res.text(), feed);
    return items.filter((i) => isCollegeStory(i.title));
  } catch {
    return [];
  }
}

// "Biggest story": admissions-specific wording, a major paper, published in the last day or two, and a photo all raise the score.
function score(i: NewsItem): number {
  const hours = (Date.now() - Date.parse(i.date)) / 3600000;
  return (TESTS.test(i.title) || STRONG.test(i.title) ? 4 : 1) + i.weight + (hours <= 24 ? 3 : hours <= 48 ? 1 : 0) + (i.image ? 1 : 0);
}

// The lead story plus the next newest headlines, at most two per paper so one source does not crowd out the rest.
export async function getNews(restCount = 3): Promise<{ lead?: NewsItem; rest: NewsItem[] }> {
  const all = (await Promise.all(FEEDS.map(load))).flat();
  const now = Date.now();
  const fresh = all.filter((x) => Date.parse(x.date) >= now - MAX_AGE_DAYS * DAY * 1000 && Date.parse(x.date) <= now + DAY * 1000);
  const uniq = [...new Map(fresh.map((x) => [x.url, x])).values()];
  if (uniq.length === 0) return { rest: [] };
  const lead = [...uniq].sort((a, b) => score(b) - score(a) || b.date.localeCompare(a.date))[0];
  const perSource: Record<string, number> = { [lead.source]: 1 };
  const rest: NewsItem[] = [];
  for (const i of uniq.filter((x) => x.url !== lead.url).sort((a, b) => b.date.localeCompare(a.date))) {
    if ((perSource[i.source] ?? 0) >= 2) continue;
    perSource[i.source] = (perSource[i.source] ?? 0) + 1;
    rest.push(i);
    if (rest.length >= restCount) break;
  }
  return { lead, rest };
}
