export interface ProjectFormData {
  title: string;
  description: string;
  bannerType: "color" | "image";
  bannerValue: string; // hex color or image URL/data URI
  startDate: string;
  endDate: string;
  duration: string;
  compensationType: "paid" | "unpaid" | "equity";
  compensationAmount: string;
  locationType: "remote" | "on-site" | "hybrid";
  locationDetail: string;
  skills: string[];
  capacity: string;
  requireApproval: boolean;
  visibility: "public" | "private";
  status: "draft" | "published";
}

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
  compensationType: "paid",
  compensationAmount: "",
  locationType: "remote",
  locationDetail: "",
  skills: [],
  capacity: "",
  requireApproval: false,
  visibility: "public",
  status: "draft",
};
