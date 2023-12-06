import { MetadataItem } from "./types";

export const getPropertyFromMetadata = (
  metadata: MetadataItem[],
  key: string,
): string => {
  const item = metadata.find((p) => p.key === key);
  if (!item) {
    return "";
  }
  return Array.isArray(item.value) ? item.value.join(" ") : item.value;
};
