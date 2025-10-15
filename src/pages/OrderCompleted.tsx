import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import DisplayImage from "../components/DisplayImage.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../hoc/DataProvider.tsx";
import { Order } from "../types/order.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { artworksToGalleryItems } from "../utils.ts";

const OrderCompleted = () => {
  const { order_id } = useParams<{ order_id: string }>();
  const data = useData();

  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [artworks, setArtworks] = useState<ArtworkCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderData = async () => {
      console.log(order_id);
      if (!order_id) return;

      try {
        setLoading(true);

        // Carica l'ordine
        const orderData = await data.getOrder(+order_id);

        if (!orderData) {
          setLoading(false);
          return;
        }

        setOrder(orderData);

        // Carica gli artworks
        const artworksData = await Promise.all(
          orderData.line_items.map((item) => data.getArtwork(item.product_id.toString())),
        );
        const artworkItems = artworksToGalleryItems(artworksData, undefined, data);
        setArtworks(artworkItems);
      } catch (error) {
        console.error("Error loading order:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [order_id, data]);

  // Calcola i valori finanziari
  const lineItemsTotal = order?.line_items.reduce((sum, item) => sum + Number(item.total) + Number(item.total_tax), 0) || 0;
  const shippingCost = Number(order?.shipping_total || 0);
  const shippingTax = Number(order?.shipping_tax || 0);

  // Calcola le commissioni artpay dalle fee_lines
  const artpayFees =
    order?.fee_lines?.reduce((sum, fee) => {
      if (fee.name === "payment-gateway-fee") {
        return sum + Number(fee.total) + Number(fee.total_tax || 0);
      }
      return sum;
    }, 0) || 0;

  const discountTotal = Number(order?.discount_total || 0);
  const totalAmount = Number(order?.total || 0);
  const totalTax = Number(order?.total_tax || 0);

  if (loading) {
    return (
      <DefaultLayout authRequired>
        <div className="flex items-center justify-center h-full min-h-[600px]">
          <CircularProgress />
        </div>
      </DefaultLayout>
    );
  }

  if (!order) {
    return (
      <DefaultLayout authRequired>
        <div className="flex items-center justify-center h-full">
          <Typography variant="h5" color="textSecondary">
            Ordine non trovato
          </Typography>
        </div>
      </DefaultLayout>
    );
  }

  console.log(order);

  return (
    <DefaultLayout authRequired>
      <div className={"flex-1 flex flex-col min-h-[600px] justify-between mb-24 pt-35 md:pt-0 px-8 md:flex-row "}>
        <div className={"order-details"}>
          <div className={"flex flex-col md:min-w-[312px]"}>
            <div className={"flex space-x-2 items-center mb-12"}>
              <h1 className={"text-2xl"}>Repilogo dell'ordine</h1>
            </div>
            {order?.line_items.map((item: any, i: number) => (
              <>
                <p className={"mb-4"}>Hai acquistato:</p>
                <Box key={item.id} className={"flex items-center w-full gap-4 mb-8"}>
                  <DisplayImage
                    src={item.image.src}
                    width="64px"
                    height="64px"
                    objectFit={"cover"}
                    borderRadius={"5px"}
                  />
                  <div className={"space-y-1"}>
                    <div className={"flex gap-2"}>
                      <Typography variant="h4" fontWeight={500}>
                        {item.name}
                      </Typography>
                      <Typography variant="h4" fontWeight={500} color="textSecondary">
                        {artworks[i]?.artistName}
                      </Typography>
                    </div>
                    <div className={"flex gap-2 text-xs text-secondary"}>
                      <Typography variant="body1" color="textSecondary">
                        {artworks[i]?.technique}
                      </Typography>
                      {artworks[i].technique && artworks[i].dimensions && "|"}
                      <Typography variant="body1" color="textSecondary">
                        {artworks[i]?.dimensions}
                      </Typography>
                    </div>
                    <Typography variant="body1">{artworks[0]?.galleryName}</Typography>
                  </div>
                </Box>
              </>
            ))}
            <div className={"flex flex-col space-y-4 mt-12 border-b border-[#D9DDFB] pb-4"}>
              <div className={"flex items-center justify-between w-full "}>
                <Typography variant="body1" className={"block"} mb={0.5}>
                  Subtotale
                </Typography>
                <Typography variant="body1">
                  € {lineItemsTotal.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </div>
              {shippingCost > 0 && (
                <div className={"flex items-center justify-between w-full "}>
                  <Typography variant="body1" className={"block"} mb={0.5}>
                    Spedizione
                  </Typography>
                  <Typography variant="body1">
                    €{" "}
                    {(shippingCost + shippingTax).toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </div>
              )}
              {artpayFees > 0 && (
                <div className={"flex items-center justify-between w-full mb-4"}>
                  <Typography variant="body1" className={"block"} mb={0.5}>
                    Commissioni artpay
                  </Typography>
                  <Typography variant="body1">
                    € {artpayFees.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </div>
              )}
              {discountTotal > 0 && (
                <div className={"flex items-center justify-between w-full"}>
                  <Typography variant="body1" className={"block"} mb={0.5}>
                    Sconto
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    -€ {discountTotal.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </div>
              )}
            </div>
            <div className={"flex items-center justify-between w-full mt-8 mb-4"}>
              <Typography variant="body1" className={"block"} mb={0.5}>
                <strong>Totale</strong>
              </Typography>
              <Typography variant="body1">
                <strong>
                  € {totalAmount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </Typography>
            </div>
            <div className={"flex items-center justify-between w-full mb-8"}>
              <Typography variant="body1" color={"textSecondary"} className={"block"} mb={0.5}>
                Di cui IVA
              </Typography>
              <Typography variant="body1" color={"textSecondary"}>
                € {totalTax.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </div>
            <div className={"bg-[#FAFAFB] rounded-lg p-4 mt-6 mb-6"}>
              <div>
                {order.shipping.first_name && (
                  <>
                    <h3 className={"text-lg font-medium mb-4"}>Dati spedizione</h3>
                    <div className={"space-y-2"}>
                      <Typography variant="body1">
                        {order.shipping.first_name} {order.shipping.last_name}
                      </Typography>
                      <Typography variant="body1">
                        {order.shipping.address_1}
                        {order.shipping.address_2 && `, ${order.shipping.address_2}`}
                      </Typography>
                      <Typography variant="body1">
                        {order.shipping.postcode} {order.shipping.city}
                      </Typography>
                      <Typography variant="body1">
                        {order.shipping.state && `${order.shipping.state}, `}
                        {order.shipping.country}
                      </Typography>
                      {order.shipping.phone && <Typography variant="body1">Tel: {order.shipping.phone}</Typography>}
                    </div>
                  </>
                )}
              </div>
              <div>
                {order.billing.first_name && (
                  <>
                    <h3 className={"text-lg font-medium mb-4 mt-4"}>Dati di fatturazione</h3>
                    <div className={"space-y-2"}>
                      <Typography variant="body1">
                        {order.billing.first_name} {order.billing.last_name}
                      </Typography>
                      <Typography variant="body1">
                        {order.billing.address_1}
                        {order.billing.address_2 && `, ${order.billing.address_2}`}
                      </Typography>
                      <Typography variant="body1">
                        {order.billing.postcode} {order.billing.city}
                      </Typography>
                      <Typography variant="body1">
                        {order.billing.state && `${order.billing.state}, `}
                        {order.billing.country}
                      </Typography>
                      {order.billing.phone && <Typography variant="body1">Tel: {order.billing.phone}</Typography>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full items-center justify-center md:max-w-[612px] shadow-custom-variant h-fit py-20 rounded-3xl px-4">
          <span className={"mb-7"}>
            <svg width="73" height="72" viewBox="0 0 73 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.9109 62.8766H24.1761C24.9664 62.8766 25.625 63.1505 26.1519 63.6984L32.0462 69.5175C33.6268 71.1175 35.1141 71.9175 36.5081 71.9175C37.9021 71.9175 39.3894 71.1175 40.9702 69.5175L46.8313 63.6984C47.3803 63.1505 48.0498 62.8766 48.84 62.8766H57.1053C59.3666 62.8766 60.9911 62.3834 61.9788 61.397C62.9668 60.4108 63.4608 58.7889 63.4608 56.5313V48.2795C63.4608 47.5342 63.7242 46.8766 64.2509 46.3067L70.1123 40.422C71.7149 38.8437 72.5107 37.3642 72.4997 35.9835C72.4889 34.6028 71.6931 33.1124 70.1123 31.5123L64.2509 25.6274C63.7242 25.0575 63.4608 24.411 63.4608 23.6877V15.4357C63.4608 13.1781 62.9668 11.5507 61.9788 10.5535C60.9911 9.55623 59.3666 9.0576 57.1053 9.0576H48.84C48.0498 9.0576 47.3803 8.79459 46.8313 8.26858L40.9702 2.44941C39.3676 0.805585 37.8747 -0.01085 36.4916 0.000108863C35.1086 0.0110677 33.6159 0.827502 32.0133 2.44941L26.1519 8.26858C25.625 8.79459 24.9664 9.0576 24.1761 9.0576H15.9109C13.6497 9.0576 12.0252 9.55076 11.0374 10.5371C10.0495 11.5234 9.55555 13.1562 9.55555 15.4357V23.6877C9.55555 24.411 9.28114 25.0575 8.73232 25.6274L2.90384 31.5123C1.30128 33.1124 0.5 34.6028 0.5 35.9835C0.5 37.3642 1.30128 38.8437 2.90384 40.422L8.73232 46.3067C9.28114 46.8766 9.55555 47.5342 9.55555 48.2795V56.5313C9.55555 58.7889 10.0495 60.4108 11.0374 61.397C12.0252 62.3834 13.6497 62.8766 15.9109 62.8766ZM33.0012 51.6326C32.7158 51.6326 32.4798 51.5834 32.2932 51.4848C32.1066 51.3863 31.9145 51.2164 31.7169 50.9751L21.8381 39.5012C21.7284 39.3479 21.6351 39.1835 21.5583 39.008C21.4814 38.8327 21.443 38.6465 21.443 38.4492C21.443 38.0986 21.5637 37.8082 21.8052 37.5779C22.0467 37.3479 22.3321 37.2328 22.6614 37.2328C22.9029 37.2328 23.1114 37.2767 23.287 37.3645C23.4627 37.452 23.6383 37.6054 23.8139 37.8247L32.9353 48.4765L49.4986 22.7014C49.8279 22.2411 50.2012 22.011 50.6184 22.011C50.9257 22.011 51.2111 22.1261 51.4745 22.3562C51.738 22.5863 51.8697 22.8658 51.8697 23.1945C51.8697 23.348 51.8368 23.5069 51.7709 23.6712C51.705 23.8356 51.6392 23.9836 51.5733 24.1151L34.2526 50.9751C34.0769 51.1944 33.8848 51.3588 33.6762 51.4683C33.4677 51.5779 33.2426 51.6326 33.0012 51.6326Z"
                fill="#42B396"
              />
            </svg>
          </span>
          <div className={"space-y-4 text-center"}>
            <p className={"text-2xl"}>Il tuo acquisto è andato a buon fine</p>
            <p className={"text-balance"}>
              Verrai contattato dalla galleria per organizzare la spedizione per il tuo acquisto!
            </p>
            <div className={"gap-4 items-center mt-12 flex flex-col"}>
              <Button
                className={"w-fit"}
                variant={"contained"}
                onClick={() => {
                  navigate("/profile/history-orders");
                }}>
                Vai ai miei ordini
              </Button>
              <Button
                onClick={() => {
                  navigate("/dashboard");
                }}>
                Torna al feed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default OrderCompleted;
