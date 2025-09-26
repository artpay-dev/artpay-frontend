import { Order } from "../../../../types/order.ts";
import BankTransferFlow from "./BankTransferFlow.tsx";
import type { BankTransferConfig } from "./types.ts";

// Legacy wrapper component for backwards compatibility
const BankTransfer = ({ order, handleRestoreOrder }: { order: Order; handleRestoreOrder: () => void }) => {
  const config: BankTransferConfig = {
    bankName: "Artpay S.R.L.",
    iban: "IT40P0301503200000003833197", 
    accountHolder: "artpay srl",
    fileUpload: {
      acceptedTypes: ["JPG", "PNG", "PDF"],
      maxSize: 10 * 1024 * 1024, // 10MB
      publicKey: "8a0960a7c6a499647503"
    },
    emailNotification: {
      toEmail: "giacomo@artpay.art",
      toName: "Team Artpay"
    }
  };

  return (
    <BankTransferFlow
      order={order}
      onCancel={handleRestoreOrder}
      config={config}
    />
  );
};

export default BankTransfer;
