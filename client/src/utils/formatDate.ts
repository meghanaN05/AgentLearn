export const formatDate = (
  date: string | Date
): string => {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export const formatDateTime = (
  date: string | Date
): string => {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export const timeAgo = (
  date: string | Date
): string => {
  const now = new Date().getTime();

  const then = new Date(date).getTime();

  const diff =
    Math.floor((now - then) / 1000);

  if (diff < 60)
    return `${diff} sec ago`;

  if (diff < 3600)
    return `${Math.floor(diff / 60)} min ago`;

  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hrs ago`;

  return `${Math.floor(diff / 86400)} days ago`;
};