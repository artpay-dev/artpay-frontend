import type { Order } from "../../../../types/order.ts";

// Generic step-based payment flow types
export interface PaymentStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
  isAccessible: boolean;
}

export interface CopyableField {
  label: string;
  value: string;
  copyText: string;
  warning?: string;
}

export interface FileUploadConfig {
  acceptedTypes: string[];
  maxSize?: number;
  uploadEndpoint?: string;
  publicKey: string;
}

export interface EmailNotificationConfig {
  toEmail: string;
  toName: string;
  templateParams?: Record<string, any>;
}

export interface BankTransferConfig {
  bankName: string;
  iban: string;
  accountHolder: string;
  fileUpload: FileUploadConfig;
  emailNotification: EmailNotificationConfig;
}

export interface PaymentFlowProps {
  order: Order;
  user?: any; // User data passed as prop
  onCancel: () => void;
  onComplete?: (result: any) => void;
  onOrderUpdate?: (order: Order) => void; // Callback for order updates
  config: BankTransferConfig;
}

// Step-specific configurations
export enum PaymentFlowStep {
  INSTRUCTIONS = 1,
  DOCUMENT_UPLOAD = 2,
  CONFIRMATION = 3
}

export interface StepComponentProps {
  step: PaymentFlowStep;
  order: Order;
  config: BankTransferConfig;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}