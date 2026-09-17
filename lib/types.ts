/** A single recruitable role within a society. */
export interface Role {
  id: string;
  title: string;
  description: string;
}

/** User profile mapping to the `profiles` table. */
export interface Profile {
  id: string;
  full_name: string | null;
  year: string | null;
  branch: string | null;
  role: "student" | "admin";
}

/** A step in the recruitment process. */
export interface ProcessStep {
  title: string;
  description: string;
}

/** A campus society. */
export interface Society {
  id: number;
  slug: string;
  name: string;
  category: "Technical" | "Cultural" | "Sports" | "Literary";
  tagline: string;
  logoInitials: string;       // exactly 2 letters — used as a text-based logo mark
  description: string;        // 2-3 plain sentences
  criteria: string;           // 1-2 sentences on who should apply
  roles: Role[];
  deadline: string;           // ISO 8601 date
  foundedYear: number;
  memberCount: number;
  meetingCadence: string;
  process: ProcessStep[];
}
