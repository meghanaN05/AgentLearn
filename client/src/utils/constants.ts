export const APP_NAME = "AgentLearn";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api";

export const TOKEN_KEY = "token";

export const THEME_KEY = "theme";

export const DEFAULT_PDF_LIMIT = 10;

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
];

export const SUMMARY_TYPES = [
  "short",
  "medium",
  "detailed",
] as const;

export const DIFFICULTIES = [
  "easy",
  "medium",
  "hard",
] as const;