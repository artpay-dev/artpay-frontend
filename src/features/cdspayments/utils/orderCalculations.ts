import { Order } from "../../../types/order.ts";

/**
 * Calcola il subtotale dell'ordine CON IVA.
 * Per ordini normali (con line_items), calcola dalla somma dei line items.
 * Per ordini gallery_auction (senza line_items), usa i valori dai fee_lines (già con IVA inclusa).
 */
export const calculateOrderSubtotal = (order: Order): number => {
  // Se l'ordine ha line_items, è un ordine normale
  if (order.line_items && order.line_items.length > 0) {
    const lineItemsTotal = order.line_items.reduce((acc, item) => acc + Number(item.total), 0);
    const taxTotal = order.line_items.reduce((acc, item) => acc + Number(item.total_tax), 0);
    return (lineItemsTotal + taxTotal) / 1.04;
  }

  // Se non ci sono line_items, è un ordine gallery_auction
  // Cerchiamo nei fee_lines il valore base (total è già con IVA inclusa)
  const auctionItem = order.fee_lines?.find(
    (fee: any) => !fee.name.toLowerCase().includes("commissione") && !fee.name.toLowerCase().includes("fee")
  );
  if (auctionItem) {
    // Il campo 'total' è già con IVA inclusa
    return Number(auctionItem.total);
  }

  // Fallback: cerca nei meta_data e aggiungi IVA al 5%
  const baseTotal = order.meta_data?.find((meta) => meta.key === "cds_auction_base_total");
  if (baseTotal) {
    const baseTotalValue = Number(baseTotal.value);
    // Aggiungi IVA al 5%
    return baseTotalValue * 1.05;
  }

  // Ultima opzione: calcola dal totale
  return Number(order.total) / 1.04;
};

/**
 * Calcola la commissione Artpay dall'ordine CON IVA.
 * Per ordini gallery_auction, cerca nei fee_lines (total è già con IVA inclusa).
 * Per ordini normali, calcola come 4% del subtotale.
 */
export const calculateArtpayFee = (order: Order, subtotal?: number): number => {
  // Cerca prima nei fee_lines (total è già con IVA inclusa)
  const artpayFeeLine = order.fee_lines?.find((fee: any) =>
    fee.name.toLowerCase().includes("commissione artpay")
  );
  if (artpayFeeLine) {
    // Il campo 'total' è già con IVA inclusa
    return Number(artpayFeeLine.total);
  }

  // Fallback: cerca nei meta_data e aggiungi IVA al 5%
  const artpayFeeMeta = order.meta_data?.find((meta) => meta.key === "artpay_fee");
  if (artpayFeeMeta) {
    const feeValue = Number(artpayFeeMeta.value);
    // Aggiungi IVA al 5%
    return feeValue * 1.05;
  }

  // Fallback finale: calcola come 4% del subtotale
  const calculatedSubtotal = subtotal ?? calculateOrderSubtotal(order);
  return calculatedSubtotal * 0.04;
};

/**
 * Calcola la commissione del payment gateway dall'ordine CON IVA.
 * Cerca nei fee_lines la fee del gateway di pagamento (total è già con IVA inclusa).
 */
export const calculatePaymentGatewayFee = (order: Order): number => {
  const gatewayFee = order.fee_lines?.find((fee: any) =>
    fee.name.toLowerCase().includes("payment-gateway-fee")
  );

  if (gatewayFee) {
    // Il campo 'total' è già con IVA inclusa
    return Number(gatewayFee.total);
  }

  return 0;
};

/**
 * Calcola il totale delle fee per un ordine (Artpay + Payment Gateway).
 */
export const calculateTotalFees = (order: Order, subtotal?: number): number => {
  const calculatedSubtotal = subtotal ?? calculateOrderSubtotal(order);
  const artpayFee = calculateArtpayFee(order, calculatedSubtotal);
  const gatewayFee = calculatePaymentGatewayFee(order);

  return artpayFee + gatewayFee;
};

/**
 * Determina se l'ordine è un ordine gallery_auction.
 */
export const isGalleryAuctionOrder = (order: Order): boolean => {
  return order.created_via === "gallery_auction" ||
         (order.line_items && order.line_items.length === 0 && order.fee_lines && order.fee_lines.length > 0);
};

/**
 * Calcola il prezzo da mostrare nelle card/transaction card CON IVA.
 * Per ordini normali: prezzo del prodotto con IVA (line_items total + tax)
 * Per ordini gallery_auction: prezzo base con IVA (da fee_lines)
 */
export const calculateDisplayPrice = (order: Order): number => {
  // Per ordini normali con line_items
  if (order.line_items && order.line_items.length > 0) {
    // Somma il totale dei line items con IVA inclusa
    const lineItemsTotal = order.line_items.reduce((acc, item) => acc + Number(item.total), 0);
    const taxTotal = order.line_items.reduce((acc, item) => acc + Number(item.total_tax), 0);
    return lineItemsTotal + taxTotal;
  }

  // Per ordini gallery_auction senza line_items
  // Usa lo stesso calcolo di calculateOrderSubtotal
  const auctionItem = order.fee_lines?.find(
    (fee: any) => !fee.name.toLowerCase().includes("commissione") && !fee.name.toLowerCase().includes("fee")
  );
  if (auctionItem) {
    return Number(auctionItem.total);
  }

  // Fallback
  const baseTotal = order.meta_data?.find((meta) => meta.key === "cds_auction_base_total");
  if (baseTotal) {
    return Number(baseTotal.value) * 1.05;
  }

  return Number(order.total);
};