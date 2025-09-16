import { DirectPurchaseProvider, DirectPurchaseView } from "../features/directpurchase";
import { PurchaseProps } from "../features/directpurchase/DirectPurchaseProvider.tsx";



const NewDirectPurchase: React.FC<PurchaseProps> = ({ orderMode = "standard" }) => {
  return (
    <DirectPurchaseProvider orderMode={orderMode}>
      <DirectPurchaseView />
    </DirectPurchaseProvider>
  );
};

export default NewDirectPurchase;