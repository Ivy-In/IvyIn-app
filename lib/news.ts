// Latest college and admissions headlines from public RSS feeds, refreshed once a day.
// Only the headline, source, date and link are used (no article text or images), and every link goes to the publisher.
// To add or remove a paper, edit FEEDS. A feed that is down or has moved is skipped without breaking the page.
export type NewsItem = { title: string; url: string; source: string; short: string; date: string };

type Feed = { source: string; short: string; url: string; filter: boolean };

const FEEDS: Feed[] = [
  { source: "The New York Times", short: "NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/Education.xml", filter: true },
  { source: "The Washington Post", short: "WaPo", url: "https://feeds.washingtonpost.com/rss/national", filter: true },
  { source: "Los Angeles Times", short: "LAT", url: "https://www.latimes.com/california/rss2.0.xml", filter: true },
  { source: "The Wall Street Journal", short: "WSJ", url: "https://feeds.content.dowjones.io/public/rss/RSSUSnews", filter: true },
  { source: "Inside Higher Ed", short: "IHE", url: "https://www.insidehighered.com/rss.xml", filter: false },
  { source: "Rutgers Today", short: "RU", url: "https://www.rutgers.edu/news/feed", filter: true },
];

// Keeps general news feeds to college and admissions stories.
const TOPIC = /\b(college|colleges|admission|admissions|admit|applicants?|university|universities|SAT|ACT|FAFSA|financial aid|tuition|scholarships?|campus|undergraduates?|Ivy League|Common App|early decision|student loans?)\b/i;
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

// Reads RSS (item) and Atom (entry) feeds.
export function parseFeed(xml: string, feed: Pick<Feed, "source" | "short">): NewsItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  const out: NewsItem[] = [];
  for (const b of blocks) {
    const title = tag(b, "title");
    let url = tag(b, "link");
    if (!url) url = b.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ?? "";
    const when = tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date");
    const t = Date.parse(when);
    if (!title || !/^https?:\/\//i.test(url) || Number.isNaN(t)) continue;
    out.push({ title, url, source: feed.source, short: feed.short, date: new Date(t).toISOString() });
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
    return feed.filter ? items.filter((i) => TOPIC.test(i.title)) : items;
  } catch {
    return [];
  }
}

// Newest first, one headline per link, at most two per paper so one source does not crowd out the rest.
export async function getNews(limit = 3): Promise<NewsItem[]> {
  const all = (await Promise.all(FEEDS.map(load))).flat();
  const cutoff = Date.now() - MAX_AGE_DAYS * DAY * 1000;
  const seen = new Set<string>();
  const perSource: Record<string, number> = {};
  const picked: NewsItem[] = [];
  for (const i of all.filter((x) => Date.parse(x.date) >= cutoff && Date.parse(x.date) <= Date.now() + DAY * 1000).sort((a, b) => b.date.localeCompare(a.date))) {
    if (seen.has(i.url) || (perSource[i.source] ?? 0) >= 2) continue;
    seen.add(i.url);
    perSource[i.source] = (perSource[i.source] ?? 0) + 1;
    picked.push(i);
    if (picked.length >= limit) break;
  }
  return picked;
}
