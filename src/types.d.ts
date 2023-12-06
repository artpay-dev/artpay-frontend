export interface FormField {
  label: string;
  description?: string;
}

export interface MetadataItem {
  id: number;
  key: string;
  value: string | string[];
}

export type CardSize = "small" | "medium" | "large";
