// Search-focused guides. Plain data so they can be reviewed and edited in one place.
// Facts about IvyIn come from the public pricing and how-it-works pages; everything else is general advice.
export type Guide = {
  slug: string;
  title: string;
  description: string;
  updated: string; // YYYY-MM-DD
  lede: string;
  sections: { heading: string; paragraphs?: string[]; bullets?: string[] }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-choose-a-college-consultant",
    title: "How to choose a college consultant",
    description:
      "Seven questions to ask before you hire a college consultant, from who does the work to what it costs and what they promise.",
    updated: "2026-11-01",
    lede:
      "College consulting ranges from a few hundred dollars for an essay review to tens of thousands for multi-year packages. These questions help you compare options fairly, whoever you hire.",
    sections: [
      {
        heading: "1. Who will actually work with my student?",
        paragraphs: [
          "Some firms sell you a senior name and hand the work to someone else. Ask who will meet with your student, how often, and whether it is the same person every time. Consistency matters: a consultant who knows your student's story can give sharper feedback than one who starts from scratch each session.",
        ],
      },
      {
        heading: "2. What does it cost, in writing?",
        paragraphs: [
          "Many firms do not publish prices and quote after a consultation. Published ranges we found vary widely: one firm lists comprehensive packages from about $5,000 to $20,000, while others quote hourly rates in the hundreds of dollars. Ask for the full price, what it covers, and what costs extra.",
        ],
      },
      {
        heading: "3. How do they treat results claims?",
        paragraphs: [
          "Be careful with admit rates such as \"98% got into a top choice\". They are the company's own numbers, and the definition of a \"top choice\" is usually unclear. Ask how the figure is counted, which students are included, and whether those students would have been admitted anyway.",
        ],
      },
      {
        heading: "4. Do they write the application for you?",
        paragraphs: [
          "A good consultant coaches. Colleges read essays and activity lists closely, and an application that does not sound like the student can hurt. Ask where the line is between guidance and writing.",
        ],
      },
      {
        heading: "5. How closely do they match your student's interests?",
        paragraphs: [
          "A student interested in engineering benefits from someone who understands that path. Ask whether you can be matched by field, and what happens if the fit is wrong.",
        ],
      },
      {
        heading: "6. What is the cancellation and refund policy?",
        paragraphs: [
          "Know what happens if your student's plans change, and whether unused time is refundable, before you pay.",
        ],
      },
      {
        heading: "7. Can your student talk to them first?",
        paragraphs: [
          "The student is the one doing the work. A short introductory call shows whether the two of them can talk openly.",
        ],
      },
    ],
  },
  {
    slug: "peer-mentor-vs-traditional-college-consultant",
    title: "Peer mentor or traditional college consultant: which is right for your family?",
    description:
      "How college mentoring from current students differs from traditional consulting, and when each makes sense.",
    updated: "2026-11-01",
    lede:
      "Traditional consultants often come from admissions offices. Peer mentors are current students who went through the process recently. Both can help, in different ways.",
    sections: [
      {
        heading: "What a traditional consultant offers",
        paragraphs: [
          "Many traditional firms hire former admissions officers or counselors with years of experience. That background can help with school-list strategy and understanding how applications are reviewed. These services are usually priced as packages, and the cost is often several thousand dollars or more.",
        ],
      },
      {
        heading: "What a peer mentor offers",
        paragraphs: [
          "A current college student has recently lived through the same process, from choosing activities to writing essays under deadline. Because they are close in age, students often find it easier to ask honest questions. Peer-led models also tend to cost less.",
          "A peer mentor is not a former admissions officer and does not have inside knowledge of how any college decides. What they bring is recent experience, relatability and time.",
        ],
      },
      {
        heading: "How to decide",
        bullets: [
          "If you want an expert view on a very selective school list and can afford a full package, a traditional firm may fit.",
          "If your student needs regular, steady support from someone they find easy to talk to, a peer mentor may fit better.",
          "If you are unsure, start with an introductory conversation with each and compare how well the person connects with your student.",
        ],
      },
      {
        heading: "How IvyIn works",
        paragraphs: [
          "IvyIn pairs each student with one current student from a top 25 university, matched to the student's field of interest. They meet one-on-one for an hour every week. Plans are $1,950 for six months or $3,250 for a year.",
        ],
      },
    ],
  },
  {
    slug: "ninth-grade-college-prep-checklist",
    title: "A ninth grade college prep checklist",
    description:
      "What freshmen and their families can do in ninth grade to prepare for college applications without burning out.",
    updated: "2026-11-01",
    lede:
      "Ninth grade is not about getting into college. It is about building habits and finding what you care about. Here is a practical checklist.",
    sections: [
      {
        heading: "Start strong in the classroom",
        bullets: [
          "Your transcript starts in ninth grade, so build good study habits early.",
          "Ask your counselor what courses are available in the coming years and which ones you need to take now to reach them.",
          "If a class is hard, get help early rather than at the end of the semester.",
        ],
      },
      {
        heading: "Explore, then go deeper",
        bullets: [
          "Try a few clubs, sports, art or volunteer activities.",
          "By the end of the year, pick one or two you care about and commit to them.",
          "Depth and growth matter more than a long list.",
        ],
      },
      {
        heading: "Think about what you enjoy",
        paragraphs: [
          "You do not need to know your major. Notice which classes and projects make you lose track of time, and write them down. Those notes become useful later when you write about yourself.",
        ],
      },
      {
        heading: "Use the summer",
        paragraphs: [
          "A job, a volunteer role, a course or a project you build yourself all count. Choose something you will stick with.",
        ],
      },
      {
        heading: "Keep a record",
        paragraphs: [
          "Start a simple document with your activities, awards, hours and what you learned. It will save hours when you fill out applications in senior year.",
        ],
      },
      {
        heading: "Talk with someone a few steps ahead",
        paragraphs: [
          "A current college student can tell you what they wish they had known. That is the idea behind IvyIn's weekly one-on-one meetings.",
        ],
      },
    ],
  },
  {
    slug: "business-or-engineering-high-school-freshman",
    title: "Business or engineering? How a high school freshman can start deciding",
    description:
      "A low-pressure way for high school students to explore business and engineering before choosing a college major.",
    updated: "2026-11-01",
    lede:
      "Many students narrow their interests to two fields: business and engineering. You do not have to choose yet, but you can start testing both.",
    sections: [
      {
        heading: "What the fields have in common",
        paragraphs: [
          "Both involve solving problems, working with teams and building things people use. Many careers combine them, such as product management, entrepreneurship and operations.",
        ],
      },
      {
        heading: "Try something small in each",
        bullets: [
          "Business: start a small project, such as selling something at school, running a club budget or helping a family business.",
          "Engineering: build something, such as a simple app, a robot kit or a science fair project.",
          "Afterward, write down which parts you enjoyed and which you did not.",
        ],
      },
      {
        heading: "Look at the classes",
        paragraphs: [
          "Engineering paths usually lean on math and science courses. Business paths use math too, plus economics, writing and communication. Look at your school's offerings and plan the courses that keep both options open.",
        ],
      },
      {
        heading: "Talk to people in each field",
        paragraphs: [
          "Ask a current college student in each major what a typical week looks like. Their answers are often more useful than a course catalog.",
        ],
      },
      {
        heading: "It is okay to change your mind",
        paragraphs: [
          "Many students change majors in college. Your goal in high school is to explore honestly and be able to explain why you are interested.",
        ],
      },
    ],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
