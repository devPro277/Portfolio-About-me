export interface Metric { value: string; label: string }
export interface BudgetLine { item: string; amount: string }
export interface ArchitectureNote { problem: string; solution: string }
export interface ProjectResult { label: string; value: string }

export type ProjectStatus = "Live" | "In Development" | "Internal";

export interface Project {
  id: string;
  index: string;
  year: number;
  title: string;
  category: string;
  status: ProjectStatus;
  budget: string;
  quote: string;
  stack: string[];
  liveUrl?: string;
  overview: string;
  vision: string;
  budgetBreakdown: BudgetLine[];
  architecture: ArchitectureNote[];
  results: ProjectResult[];
}

export interface StackGroup { title: string; blurb: string; items: string[] }

export const profile = {
  name: "Islombek Abduvaliyev",
  role: "Frontend & Full-Stack Engineer",
  email: "abduvaliyev.i@mail.ru",
  github: "https://github.com/devPro277",
  githubHandle: "devPro277",
  upwork: "https://www.upwork.com/freelancers/~01f441e1fdd6388fc3",
};

export const metrics: Metric[] = [
  { value: "15+", label: "Production Systems" },
  { value: "99.4%", label: "Avg. Performance" },
  { value: "3+", label: "Years Engineering" },
  { value: "100%", label: "Client Delivery" },
];

export const stackGroups: StackGroup[] = [
  {
    title: "Frontend & Motion",
    blurb: "Interfaces that load fast, move precisely and stay out of the way.",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js"],
  },
  {
    title: "Backend & Systems",
    blurb: "Boring, reliable services behind the interface.",
    items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST APIs", "JWT Auth"],
  },
  {
    title: "AI & Workflow",
    blurb: "Language models wired into real product flows.",
    items: ["LLM Integration", "AI Prompt Engineering", "Headless UI Architecture"],
  },
];

// Deploy qilganingdan keyin haqiqiy havolalarni shu yerga yoz:
const UNISPHERE_URL = "https://unisphera-academy.vercel.app/";
const MARIS_URL = "https://maris-uz.vercel.app/";

export const projects: Project[] = [
  {
    id: "unisphere-academy",
    index: "01",
    year: 2026,
    title: "UniSphere Academy",
    category: "EdTech Platform & Design System",
    status: "Live",
    budget: "$2,500 – $4,000",
    quote: "One place where students, teachers and parents see the same schedule, progress and payments.",
    stack: ["React", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL"],
    liveUrl: "https://unisphera-academy.vercel.app/",
    overview:
      "A platform for an IT and language education center: course catalogue, class schedules, enrollment, teacher tools and a reusable design system that keeps every screen consistent as the center adds new programs.",
    vision:
      "The founder wanted to replace spreadsheets and chat threads with one calm product. Students should enroll in minutes, teachers should log lessons without training, and the center should look as serious as a university.",
    budgetBreakdown: [
      { item: "Design system & UI kit", amount: "$900" },
      { item: "Platform frontend", amount: "$1,800" },
      { item: "API, auth & database", amount: "$1,300" },
    ],
    architecture: [
      { problem: "Screens drifted visually as new programs were added.", solution: "Built a token-based design system with typed component variants, so new pages reuse primitives instead of copying styles." },
      { problem: "Schedule and enrollment views were slow with many groups.", solution: "Paginated queries, indexed PostgreSQL lookups and client-side caching kept lists responsive." },
      { problem: "Three roles needed different views of the same data.", solution: "Role-based routing with JWT claims and a headless UI layer rendering role-specific shells." },
    ],
    results: [
      { label: "Enrollment time", value: "Under 3 min" },
      { label: "Lighthouse performance", value: "98 / 100" },
      { label: "Admin work removed", value: "~60%" },
    ],
  },
  {
    id: "maris-academy",
    index: "02",
    year: 2026,
    title: "Maris Academy",
    category: "High-Conversion Educational Landing Page",
    status: "Live",
    budget: "$400 – $900",
    quote: "Clean, fast and trustworthy. A parent should understand the offer and leave a phone number in one scroll.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    liveUrl: "https://maris-uz.vercel.app/",
    overview:
      "A single-page minimalist site for an educational academy, built around one goal: turning mobile visitors into trial-lesson requests.",
    vision:
      "The client had a busy, slow template site. They asked for fewer words, stronger proof and a form that works well on a phone.",
    budgetBreakdown: [
      { item: "Copy structure & UI design", amount: "$200" },
      { item: "Build & animation", amount: "$350" },
      { item: "Forms, analytics & deploy", amount: "$150" },
    ],
    architecture: [
      { problem: "Heavy imagery slowed the first paint on mobile networks.", solution: "Statically generated page, responsive image sizes and deferred non-critical scripts." },
      { problem: "Long forms lowered completion.", solution: "Two-field lead form with inline validation and instant confirmation." },
      { problem: "Motion distracted from the offer.", solution: "A single entrance sequence in the hero; everything else stays still." },
    ],
    results: [
      { label: "Lighthouse performance", value: "99 / 100" },
      { label: "First contentful paint", value: "0.8 s" },
      { label: "Lead form completion", value: "+2.4x" },
    ],
  },
  {
    id: "greenservise-uz",
    index: "03",
    year: 2026,
    title: "GreenServise.uz",
    category: "Technician Dispatch Web App & Telegram Mini App",
    status: "In Development",
    budget: "$1,200 – $2,500",
    quote: "A customer taps one button in Telegram and a technician is on the way. No calls, no waiting.",
    stack: ["React", "TypeScript", "Telegram Web App", "Node.js", "MongoDB"],
    overview:
      "A booking and dispatch system for home appliance repair in Uzbekistan. Customers book inside Telegram, dispatchers assign technicians, and technicians update job status from their phones.",
    vision:
      "The owner already received orders by phone and chat. He wanted bookings to land in one queue, with technicians assigned and customers kept informed automatically.",
    budgetBreakdown: [
      { item: "Telegram Mini App (customer)", amount: "$700" },
      { item: "Dispatcher dashboard", amount: "$800" },
      { item: "Backend, notifications & deploy", amount: "$700" },
    ],
    architecture: [
      { problem: "Customers will not install or register for another app.", solution: "Used Telegram identity through the Web App API, so booking needs zero sign-up." },
      { problem: "Orders arrived faster than dispatchers could route them.", solution: "Realtime job queue with status transitions and one-tap technician assignment." },
      { problem: "Users on weak mobile connections.", solution: "Small bundle, optimistic UI updates and retry logic on every mutation." },
    ],
    results: [
      { label: "Booking steps", value: "4 taps" },
      { label: "Dispatch time", value: "-70%" },
      { label: "Missed requests", value: "Near zero" },
    ],
  },
  {
    id: "nextvision-dashboard",
    index: "04",
    year: 2025,
    title: "NextVision Internal Dashboard",
    category: "Realtime Analytics & Workflow Engine",
    status: "Internal",
    budget: "Internal build",
    quote: "Every project, task and metric in one view, so the team stops asking where things stand.",
    stack: ["React", "TypeScript", "WebSockets", "Express", "PostgreSQL"],
    overview:
      "The internal operating system of NextVision group: live project analytics, configurable workflows and a task engine that moves work between design, development and delivery.",
    vision:
      "As the group took on more client work, status lived in too many places. The goal was one dashboard that shows delivery health in seconds and can be reconfigured without code.",
    budgetBreakdown: [
      { item: "Product design & data model", amount: "Internal" },
      { item: "Realtime frontend", amount: "Internal" },
      { item: "Workflow engine & API", amount: "Internal" },
    ],
    architecture: [
      { problem: "Charts re-rendered constantly with live data.", solution: "Batched WebSocket updates, memoized selectors and virtualized tables." },
      { problem: "Each team wanted a different process.", solution: "A declarative workflow engine: stages and rules are stored as data and edited in the UI." },
      { problem: "Growing history slowed analytics queries.", solution: "Pre-aggregated PostgreSQL views refreshed on write." },
    ],
    results: [
      { label: "Update latency", value: "< 200 ms" },
      { label: "Status meetings", value: "-50%" },
      { label: "Team adoption", value: "100%" },
    ],
  },
];