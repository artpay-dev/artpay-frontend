import useCdsPaymentStore from '../../stores/paymentStore.ts';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: 'In attesa di pagamento', className: 'bg-amber-100 text-amber-700' },
  'on-hold':  { label: 'Pagamento in corso...',  className: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Pagamento confermato',   className: 'bg-green-100 text-green-700' },
  completed:  { label: 'Ordine completato',       className: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Ordine annullato',        className: 'bg-gray-100 text-gray-500' },
  failed:     { label: 'Pagamento fallito',       className: 'bg-red-100 text-red-600' },
};

const OrderSummary = () => {
  const { orderDetails } = useCdsPaymentStore();
  if (!orderDetails) return null;

  const baseTotal = Number(orderDetails.base_total);
  const platformFee = Number(orderDetails.platform_fee);
  const grandTotal = Number(orderDetails.grand_total);
  const fmt = (n: number) => n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const status = STATUS_CONFIG[orderDetails.status];

  return (
    <div className="space-y-5 mb-8">
      <div className="flex items-start gap-4">
        {orderDetails.lot_image_url && (
          <div className="size-16 overflow-hidden border border-gray-200 rounded-md bg-white flex-shrink-0 flex justify-center items-center">
            <img
              src={orderDetails.lot_image_url}
              alt="Lotto"
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <p className="text-secondary text-sm leading-snug">{orderDetails.description}</p>
          <div className="flex items-center gap-2">
            {orderDetails.vendor_logo_url && (
              <img
                src={orderDetails.vendor_logo_url}
                alt={orderDetails.vendor_name}
                className="h-4 object-contain"
              />
            )}
            <span className="text-secondary text-sm">{orderDetails.vendor_name}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Prezzo aggiudicazione</span>
          <span className="text-tertiary">€ {fmt(baseTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Commissione Artpay (4%)</span>
          <span className="text-tertiary">€ {fmt(platformFee)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <span className="font-semibold text-tertiary">Totale</span>
          <span className="font-semibold text-tertiary">€ {fmt(grandTotal)}</span>
        </div>
      </div>

      {status && (
        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
          {status.label}
        </span>
      )}
    </div>
  );
};

export default OrderSummary;
