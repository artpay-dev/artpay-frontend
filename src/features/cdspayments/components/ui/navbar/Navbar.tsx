import { useState } from 'react';
import LogoFastArtpay from '../../../../../components/icons/LogoFastArtpay.tsx';
import useCdsPaymentStore from '../../../stores/paymentStore.ts';
import { track } from '../../../lib/pillarAnalytics.ts';
import AbandonCartModal from '../../abandonmodal/AbandonCartModal.tsx';

const Navbar = ({ returnUrl }: { returnUrl?: string }) => {
  const { paymentIntent, paymentMethod, orderDetails } = useCdsPaymentStore();
  const vendorName = orderDetails?.vendor_name?.toLowerCase() ?? '';
  const isSantagostino = vendorName.includes("sant'agostino") || vendorName.includes('auction-house-test');
  const [modalOpen, setModalOpen] = useState(false);

  const currentStage = (() => {
    if (paymentIntent?.next_action?.type === 'display_bank_transfer_instructions') return 'bank_transfer';
    if (paymentIntent) return 'checkout';
    if (paymentMethod) return 'method_selected';
    return 'selection';
  })();

  const doLeave = () => {
    track('back_clicked', {
      stage: currentStage,
      email: orderDetails?.customer_email,
      order: orderDetails?.order_id,
      total: orderDetails?.grand_total,
    });
    if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      window.history.back();
    }
  };

  return (
    <>
      <header className="fixed w-full z-50 top-6 px-2 max-w-2xl md:px-0">
        <nav className="p-4 custom-navbar flex justify-between items-center w-full bg-white">
          <button
            className="text-tertiary cursor-pointer underline underline-offset-3 leading-[125%]"
            onClick={() => setModalOpen(true)}>
            Torna indietro
          </button>
          {!orderDetails ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          ) : isSantagostino && orderDetails.vendor_logo_url ? (
            <img src={orderDetails.vendor_logo_url} alt={orderDetails.vendor_name} className="h-8 w-auto object-contain" />
          ) : (
            <LogoFastArtpay />
          )}
        </nav>
      </header>

      <AbandonCartModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirmLeave={doLeave}
      />
    </>
  );
};

export default Navbar;