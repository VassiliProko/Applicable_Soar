// ── User Profiles & Roles ──────────────────────────────────

export type UserRole = "poster" | "applicant" | "both";

export interface UserProfile {
  id: string;
  userId: string;
  role: UserRole;
  fullName: string | null;
  skills: string[];
  portfolioUrl: string | null;
  resumeUrl: string | null;
}

export interface ApplicantProfileFormData {
  fullName: string;
  skills: string[];
  portfolioUrl: string;
  resumeUrl: string;
}

// ── Applications ───────────────────────────────────────────

export type ApplicationStatus = "applied" | "accepted" | "rejected" | "withdrawn";

export interface Application {
  id: string;
  userId: string;
  projectId: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationWithProject extends Application {
  project: {
    id: string;
    title: string;
    bannerType: string;
    bannerValue: string;
    compensationType: string;
    compensationAmount: string | null;
    locationType: string;
    organization: {
      companyName: string;
      website: string | null;
      industry: string;
    } | null;
  };
}

// ── Organizations ──────────────────────────────────────────

export interface OrganizationFormData {
  companyName: string;
  website: string;
  description: string;
  industry: string;
  type: "non-profit" | "for-profit" | "government" | "educational" | "other";
}

export const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Education",
  "Finance",
  "Real Estate",
  "Retail",
  "Manufacturing",
  "Media & Entertainment",
  "Non-Profit",
  "Consulting",
  "Legal",
  "Other",
] as const;

export const ORG_TYPE_OPTIONS = [
  { value: "non-profit" as const, label: "Non-Profit" },
  { value: "for-profit" as const, label: "For-Profit" },
  { value: "government" as const, label: "Government" },
  { value: "educational" as const, label: "Educational" },
  { value: "other" as const, label: "Other" },
] as const;

export interface ProjectFormData {
  title: string;
  description: string;
  bannerType: "color" | "image";
  bannerValue: string; // hex color or image URL/data URI
  startDate: string;
  endDate: string;
  duration: string;
  timeCommitment: string;
  compensationType: "paid" | "unpaid" | "equity";
  compensationAmount: string;
  projectType: string;
  locationType: "remote" | "on-site" | "hybrid";
  locationDetail: string[];
  skills: string[];
  capacity: string;
  requireApproval: boolean;
  visibility: "public" | "private";
  status: "draft" | "published";
}

export interface ProjectAttachment {
  id: string;
  fileName: string;
  fileType: string;
  url: string;
  position: number;
}

export interface ProjectWithMeta extends ProjectFormData {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  attachments: ProjectAttachment[];
}

export const PROJECT_TYPE_OPTIONS = [
  { value: "internship", label: "Internship" },
  { value: "research", label: "Research" },
  { value: "volunteer", label: "Volunteer" },
  { value: "freelance", label: "Freelance" },
  { value: "fellowship", label: "Fellowship" },
  { value: "contract", label: "Contract" },
  { value: "open-source", label: "Open Source" },
] as const;

export const BANNER_COLORS = [
  "#1B2838",
  "#2D4A3E",
  "#3B2D4A",
  "#4A2D2D",
  "#2D3B4A",
  "#4A3B2D",
  "#2D4A4A",
  "#3B3B2D",
] as const;

export const INITIAL_PROJECT: ProjectFormData = {
  title: "",
  description: "",
  bannerType: "color",
  bannerValue: BANNER_COLORS[0],
  startDate: "",
  endDate: "",
  duration: "",
  timeCommitment: "",
  compensationType: "paid",
  compensationAmount: "",
  projectType: "",
  locationType: "remote",
  locationDetail: [],
  skills: [],
  capacity: "",
  requireApproval: false,
  visibility: "public",
  status: "draft",
};
