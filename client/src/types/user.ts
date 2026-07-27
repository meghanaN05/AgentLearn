export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;

  joinedAt?: string;

  uploadedPDFs: number;

  completedTests: number;

  averageScore: number;

  totalStudyHours: number;
}

export interface UserSettings {
  theme: "light" | "dark";

  notifications: boolean;

  emailUpdates: boolean;
}