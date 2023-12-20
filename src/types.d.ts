export interface FormField {
  label: string;
  description?: string;
}

export interface MetadataItem {
  id: number;
  key: string;
  value: { [key: string]: string };
}

export type CardSize = "small" | "medium" | "large";
