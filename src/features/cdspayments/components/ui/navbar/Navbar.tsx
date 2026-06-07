import LogoFastArtpay from '../../../../../components/icons/LogoFastArtpay.tsx';
import useCdsPaymentStore from '../../../stores/paymentStore.ts';
import { track } from '../../../lib/pillarAnalytics.ts';

const Navbar = ({ returnUrl }: { returnUrl?: string }) => {
  const { paymentIntent, paymentMethod, orderDetails } = useCdsPaymentStore();

  const currentStage = (() => {
    if (paymentIntent?.next_action?.type === 'display_bank_transfer_instructions') return 'bank_transfer';
    if (paymentIntent) return 'checkout';
    if (paymentMethod) return 'method_selected';
    return 'selection';
  })();

  const handleBack = () => {
    track('back_clicked', {
      stage: currentStage,
      email: orderDetails?.customer_email,
      order: orderDetails?.order_id,
    });
    if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      window.history.back();
    }
  };

  return (
    <header className="fixed w-full z-50 top-6 px-2 max-w-2xl md:px-0">
      <nav className="p-4 custom-navbar flex justify-between items-center w-full bg-white">
        <button
          className="text-tertiary cursor-pointer underline underline-offset-3 leading-[125%]"
          onClick={handleBack}>
          Torna indietro
        </button>
        <LogoFastArtpay />
      </nav>
    </header>
  );
};

export default Navbar;
