// Mentor data behind the home page. Names are shown with each mentor's permission.
// Emails and phone numbers are deliberately not kept here.
export type Mentor = { name: string; school: string; major: string; year: number; senior?: boolean; display?: string };

export const MENTORS: Mentor[] = [
  { name: "Curtis Lee", school: "Cornell", major: "Business", year: 2030, senior: true },
  { name: "Tommy Li", school: "Cornell", major: "Economics and Government", year: 2030, senior: true },
  { name: "Anders Gustafson", school: "Tufts", major: "Political Science and Government", year: 2030 },
  { name: "Annabelle Lei", school: "Columbia", major: "Economics and Statistics", year: 2030 },
  { name: "Brandon Hu", school: "NYU", major: "Liberal Studies Core", year: 2030 },
  { name: "Derek Somers", school: "UC Berkeley", major: "Computer Science", year: 2030 },
  { name: "Eleanor Meyer", school: "Cornell", major: "Biology and Linguistics", year: 2030 },
  { name: "Erwin Wang", school: "NYU", major: "Finance and Data Science", year: 2030, display: "NYU Stern" },
  { name: "Evelyn Brown", school: "Michigan", major: "Linguistics", year: 2030 },
  { name: "Grant Lang", school: "Dartmouth", major: "Economics", year: 2030 },
  { name: "Hope Kim", school: "Bowdoin", major: "Environmental Studies", year: 2030 },
  { name: "Jason Yu", school: "NYU", major: "Economics", year: 2030 },
  { name: "Jason Zhang", school: "NYU", major: "Finance", year: 2030, display: "NYU Stern" },
  { name: "John Eapen", school: "UNC Chapel Hill", major: "Finance", year: 2030 },
  { name: "Kaden Lin", school: "Cornell", major: "Economics", year: 2030 },
  { name: "Ken Zhao", school: "Columbia", major: "Computer Science", year: 2030 },
  { name: "Leo Tu", school: "Babson", major: "Tech Entrepreneurship", year: 2030 },
  { name: "Max Lee", school: "Stanford", major: "Computer Science and Mathematics", year: 2029 },
  { name: "Matt Guo", school: "USC", major: "Business Administration", year: 2030, display: "USC Marshall" },
  { name: "Matthew Rosebaum", school: "Middlebury", major: "International Politics and Economics", year: 2030 },
  { name: "Naveen Hernandez", school: "UC Berkeley", major: "Chemistry", year: 2030 },
  { name: "Ray Xin", school: "NYU", major: "Finance", year: 2030, display: "NYU Stern" },
  { name: "Ryan Shi", school: "Stanford", major: "Symbolic Systems", year: 2030 },
  { name: "Simon Wang", school: "Waterloo", major: "Math", year: 2031 },
  { name: "Yara Aziz", school: "Cornell", major: "Nutritional Science", year: 2030 },
];

// Mentors per university, largest first.
export const SCHOOLS = Object.entries(
  MENTORS.reduce<Record<string, number>>((acc, m) => ((acc[m.school] = (acc[m.school] ?? 0) + 1), acc), {}),
)
  .map(([school, count]) => ({ school, count }))
  .sort((a, b) => b.count - a.count || a.school.localeCompare(b.school));

export const FIELDS = [
  "Finance", "Economics", "Computer Science", "Business", "Government", "Linguistics",
  "Biology", "Chemistry", "Math", "Entrepreneurship", "Environmental Studies", "Data Science",
];

// TEMPORARY: not real data yet. Replace with the true total before promoting this number.
export const TEMP_TOP_COLLEGE_OFFERS = 80;

export const STATS = {
  mentors: MENTORS.length,
  universities: SCHOOLS.length,
  offers: TEMP_TOP_COLLEGE_OFFERS,
};

export type Track = "Business and Economics" | "Tech and Math" | "Humanities and Social Science" | "Sciences";
export const TRACKS: Track[] = ["Business and Economics", "Tech and Math", "Humanities and Social Science", "Sciences"];

// Which of the four tracks a single major belongs to.
function trackOfOne(major: string): Track {
  const m = major.toLowerCase();
  if (/(finance|econom|business|entrepreneur)/.test(m)) return "Business and Economics";
  if (/(computer|math|symbolic|statistic|data)/.test(m)) return "Tech and Math";
  if (/(chem|biolog|nutrition|environment)/.test(m)) return "Sciences";
  return "Humanities and Social Science";
}

// A double major ("Economics and Statistics") counts in every track it touches, so it shows under each tab.
// Majors whose official name contains "and" are kept whole.
const SINGLE_MAJORS_WITH_AND = ["political science and government"];
export function tracksOf(major: string): Track[] {
  if (SINGLE_MAJORS_WITH_AND.includes(major.toLowerCase())) return [trackOfOne(major)];
  return [...new Set(major.split(/\s+and\s+/i).map(trackOfOne))];
}

// The first track, for anything that needs just one.
export function trackOf(major: string): Track {
  return tracksOf(major)[0];
}

export const initials = (school: string) =>
  school.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#244CFF,#17191D)", "linear-gradient(135deg,#1E3599,#17191D)",
  "linear-gradient(135deg,#244CFF,#1E3599)", "linear-gradient(135deg,#17191D,#244CFF)",
  "linear-gradient(135deg,#4B4D51,#17191D)", "linear-gradient(135deg,#244CFF,#4B4D51)",
];

export const personInitials = (name: string) =>
  name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
