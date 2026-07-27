export const truncateText = (
  text: string,
  length = 100
): string => {
  if (text.length <= length) return text;

  return text.slice(0, length) + "...";
};

export const formatFileSize = (
  bytes: number
): string => {
  if (bytes < 1024)
    return `${bytes} B`;

  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(2)} KB`;

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
};

export const generateRandomId = () =>
  crypto.randomUUID();

export const calculatePercentage = (
  score: number,
  total: number
) => {
  if (total === 0) return 0;

  return Math.round((score / total) * 100);
};

export const sleep = (
  ms: number
): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );