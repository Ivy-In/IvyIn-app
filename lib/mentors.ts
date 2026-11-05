// Mentor data behind the home page stats. Names, emails and phone numbers are left out on purpose:
// the public site shows where mentors study, not who they are.
export type Mentor = { school: string; major: string; year: number; senior?: boolean };

export const MENTORS: Mentor[] = [
  { school: "Cornell", major: "Business", year: 2030, senior: true },
  { school: "Cornell", major: "Economics and Government", year: 2030, senior: true },
  { school: "Tufts", major: "Political Science and Government", year: 2030 },
  { school: "Columbia", major: "Economics and Statistics", year: 2030 },
  { school: "NYU", major: "Liberal Studies Core", year: 2030 },
  { school: "UC Berkeley", major: "Computer Science", year: 2030 },
  { school: "Cornell", major: "Biology and Linguistics", year: 2030 },
  { school: "NYU", major: "Finance and Data Science", year: 2030 },
  { school: "Michigan", major: "Linguistics", year: 2030 },
  { school: "Dartmouth", major: "Economics", year: 2030 },
  { school: "Bowdoin", major: "Environmental Studies", year: 2030 },
  { school: "NYU", major: "Economics", year: 2030 },
  { school: "NYU", major: "Finance", year: 2030 },
  { school: "UNC Chapel Hill", major: "Finance", year: 2030 },
  { school: "Cornell", major: "Economics", year: 2030 },
  { school: "Columbia", major: "Computer Science", year: 2030 },
  { school: "Babson", major: "Tech Entrepreneurship", year: 2030 },
  { school: "Stanford", major: "Computer Science and Mathematics", year: 2029 },
  { school: "USC", major: "Business Administration", year: 2030 },
  { school: "Middlebury", major: "International Politics and Economics", year: 2030 },
  { school: "UC Berkeley", major: "Chemistry", year: 2030 },
  { school: "NYU", major: "Finance", year: 2030 },
  { school: "Stanford", major: "Symbolic Systems", year: 2030 },
  { school: "Waterloo", major: "Math", year: 2031 },
  { school: "Cornell", major: "Nutritional Science", year: 2030 },
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
