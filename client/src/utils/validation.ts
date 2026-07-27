export const validateEmail = (
  email: string
): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

export const validatePassword = (
  password: string
): boolean => {
  return password.length >= 8;
};

export const validatePDF = (
  file: File
): string | null => {
  if (file.type !== "application/pdf") {
    return "Only PDF files are allowed.";
  }

  if (file.size > 20 * 1024 * 1024) {
    return "Maximum file size is 20 MB.";
  }

  return null;
};

export const validateRequired = (
  value: string
): boolean => {
  return value.trim().length > 0;
};