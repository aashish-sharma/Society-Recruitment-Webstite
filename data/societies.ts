import { Society } from "@/lib/types";

export const societies: Society[] = [
  // ── Technical ───────────────────────────────────────────────────
  {
    id: 1,
    slug: "Google Developers Group",
    name: "Google Developers Group",
    category: "Technical",
    tagline: "Build things that ship.",
    logoInitials: "GDG",
    description:
      "GDG is a student-run group focused on practical software development. Members collaborate on semester-long projects spanning web, mobile, and data tooling. The emphasis is on writing production-quality code, not just prototypes.",
    criteria:
      "Open to anyone comfortable reading documentation and writing code in at least one language. Prior open-source or project experience is helpful but not required.",
    roles: [
      {
        id: "cc-web-lead",
        title: "Web Lead",
        description:
          "Own the front-end architecture for the semester project. Coordinate with designers and back-end contributors to ship a polished interface.",
      },
      {
        id: "cc-ml-contributor",
        title: "ML Contributor",
        description:
          "Research and implement machine-learning features within the project. Responsible for data pipelines, model selection, and integration testing.",
      },
      {
        id: "cc-design-systems",
        title: "Design Systems Volunteer",
        description:
          "Maintain the shared component library and style guide. Ensure visual consistency across all project surfaces.",
      },
    ],
    deadline: "2026-10-02",
    foundedYear: 2019,
    memberCount: 52,
    meetingCadence: "Weekly, Saturday afternoons",
    process: [
      { title: "Apply", description: "Submit the form on this site before the deadline." },
      { title: "Shortlist review", description: "The core team reviews applications and shortlists candidates." },
      { title: "Interview / trial task", description: "Shortlisted applicants complete a small take-home task and a brief interview." },
      { title: "Results", description: "Accepted members are notified within a week of interviews." },
    ],
  },
  {
    id: 2,
    slug: "ARES Society",
    name: "ARES Society",
    category: "Technical",
    tagline: "Machines, from scratch.",
    logoInitials: "AR",
    description:
      "The ARES Guild designs, builds, and programs autonomous machines from raw materials. Teams work through the full hardware-software cycle each semester, ending with a public demo day. Safety training is provided in the first two weeks.",
    criteria:
      "Some familiarity with electronics or mechanical design is expected. You should be comfortable working in a workshop environment.",
    roles: [
      {
        id: "rg-mech-lead",
        title: "Mechanical Lead",
        description:
          "Design the physical chassis and drive train. Manage CAD files, fabrication schedules, and material procurement.",
      },
      {
        id: "rg-firmware",
        title: "Firmware Engineer",
        description:
          "Write and test embedded code for motor controllers, sensors, and communication modules. Debug hardware-software integration issues on the bench.",
      },
    ],
    deadline: "2026-10-02",
    foundedYear: 2017,
    memberCount: 30,
    meetingCadence: "Twice a week, Wednesday & Friday evenings",
    process: [
      { title: "Apply", description: "Fill out the application form before the deadline." },
      { title: "Workshop day", description: "Attend a hands-on workshop where you'll work with the team on a small build." },
      { title: "Team review", description: "Leads evaluate workshop performance and application responses." },
      { title: "Results", description: "Selected members are announced within five days." },
    ],
  },

  // ── Cultural ────────────────────────────────────────────────────
  {
    id: 3,
    slug: "Ashwamedh",
    name: "Ashwamedh",
    category: "Cultural",
    tagline: "Every semester, a new act.",
    logoInitials: "AS",
    description:
      "Ashwamedh Society produces one original stage production each semester, from script to curtain call. Members handle every aspect of the show — writing, acting, set design, and technical production. No prior theatre experience is necessary.",
    criteria:
      "Anyone willing to commit to rehearsal schedules and contribute to a team-driven creative process. Auditions are held in the first week after recruitment closes.",
    roles: [
      {
        id: "ss-actor",
        title: "Actor",
        description:
          "Audition for and perform roles in the semester production. Attend all scheduled rehearsals and contribute to character development workshops.",
      },
      {
        id: "ss-stage-manager",
        title: "Stage Manager",
        description:
          "Coordinate rehearsal logistics, maintain the prompt book, and call cues during performances. Act as the primary link between the director and all production teams.",
      },
      {
        id: "ss-lighting-sound",
        title: "Lighting & Sound",
        description:
          "Design and operate lighting rigs and audio systems for rehearsals and shows. Collaborate with the director on mood, timing, and technical feasibility.",
      },
    ],
    deadline: "2026-10-02",
    foundedYear: 2015,
    memberCount: 40,
    meetingCadence: "Weekly, Thursday evenings",
    process: [
      { title: "Apply", description: "Submit your application through this site." },
      { title: "Audition / portfolio", description: "Actors audition in person; backstage roles submit a short portfolio or past work." },
      { title: "Callbacks", description: "Selected applicants are called back for a second round with the director." },
      { title: "Results", description: "Cast and crew lists are posted within a week." },
    ],
  },
  {
    id: 4,
    slug: "rhythm-collective",
    name: "Rhythm Collective",
    category: "Cultural",
    tagline: "Dance without borders.",
    logoInitials: "RC",
    description:
      "Rhythm Collective brings together dancers across styles — contemporary, street, classical, and everything in between. The group trains weekly and performs at campus-wide events each semester. Workshops by visiting choreographers are a regular feature.",
    criteria:
      "All skill levels are welcome. You should enjoy collaborative movement and be available for weekly practice sessions.",
    roles: [
      {
        id: "rc-choreographer",
        title: "Choreographer",
        description:
          "Create original routines for the group's semester showcase. Lead rehearsals, give feedback, and adapt pieces based on team strengths.",
      },
      {
        id: "rc-performer",
        title: "Performer",
        description:
          "Learn and perform choreography at campus events. Attend regular practice sessions and contribute ideas during creative workshops.",
      },
      {
        id: "rc-event-coordinator",
        title: "Event Coordinator",
        description:
          "Handle venue bookings, costume logistics, and event-day scheduling. Serve as the point of contact with campus administration.",
      },
    ],
    deadline: "2026-10-02",
    foundedYear: 2020,
    memberCount: 35,
    meetingCadence: "Weekly, Sunday mornings",
    process: [
      { title: "Apply", description: "Submit the application form on this site." },
      { title: "Open jam session", description: "Attend a casual group session to dance together and meet the team." },
      { title: "Results", description: "Everyone who attends the jam and submits an application is welcomed in." },
    ],
  },

  // ── Sports ──────────────────────────────────────────────────────
  {
    id: 5,
    slug: "court-and-field-club",
    name: "Court & Field Club",
    category: "Sports",
    tagline: "Train together, play harder.",
    logoInitials: "CF",
    description:
      "Court & Field Club organises regular training sessions, friendly matches, and inter-campus tournaments across multiple sports. The club supplies shared equipment and coordinates schedules so members can try more than one discipline per semester.",
    criteria:
      "Open to all fitness levels. You should be willing to follow a structured training plan and show up consistently.",
    roles: [
      {
        id: "cf-captain",
        title: "Team Captain",
        description:
          "Lead your sport's training sessions and represent the team in tournament coordination. Communicate schedules and roster decisions to all members.",
      },
      {
        id: "cf-fitness",
        title: "Fitness Coordinator",
        description:
          "Plan cross-sport conditioning sessions and track attendance. Work with captains to design warm-up and recovery routines.",
      },
    ],
    deadline: "2026-10-02",
    foundedYear: 2018,
    memberCount: 60,
    meetingCadence: "Three sessions per week, flexible schedule",
    process: [
      { title: "Apply", description: "Fill out the form and indicate your preferred sport(s)." },
      { title: "Trial sessions", description: "Attend two trial training sessions with your chosen sport's squad." },
      { title: "Results", description: "Captains confirm roster spots after trials." },
    ],
  },

  // ── Literary ────────────────────────────────────────────────────
  {
    id: 6,
    slug: "Axiom",
    name: "Axiom",
    category: "Literary",
    tagline: "Words worth arguing about.",
    logoInitials: "AX",
    description:
      "The Axiom publishes a semesterly journal of essays, fiction, poetry, and visual work. The editorial process is collaborative — every submission is workshopped before publication. The group also hosts reading nights and informal writing circles.",
    criteria:
      "You should enjoy reading critically and giving constructive feedback. Publication experience is not required.",
    roles: [
      {
        id: "tm-editor",
        title: "Editor",
        description:
          "Review and workshop submitted pieces. Coordinate with writers on revisions, fact-checking, and final copy before layout.",
      },
      {
        id: "tm-writer",
        title: "Writer",
        description:
          "Contribute original essays, fiction, or poetry to the journal. Participate in peer-review sessions and revision cycles.",
      },
      {
        id: "tm-layout",
        title: "Layout Designer",
        description:
          "Design the journal's print and digital layouts. Handle typesetting, image placement, and cover design in collaboration with editors.",
      },
    ],
    deadline: "2026-10-02",
    foundedYear: 2016,
    memberCount: 25,
    meetingCadence: "Biweekly, Tuesday evenings",
    process: [
      { title: "Apply", description: "Submit the application along with a short writing sample (any genre)." },
      { title: "Editorial review", description: "Current editors review samples and application responses." },
      { title: "Workshop trial", description: "Shortlisted applicants join a live workshop session to give and receive feedback." },
      { title: "Results", description: "Accepted members are notified by email within a week." },
    ],
  },
];

/** Look up a single society by slug. */
export function getSocietyBySlug(slug: string): Society | undefined {
  return societies.find((s) => s.slug === slug);
}

/** Return all unique categories. */
export function getCategories(): string[] {
  return Array.from(new Set(societies.map((s) => s.category)));
}
