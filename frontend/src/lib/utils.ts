import { formatDistanceToNow } from "date-fns";

export const formatLastSeen = (date: string) => {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};