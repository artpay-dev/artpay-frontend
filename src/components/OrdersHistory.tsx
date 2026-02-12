import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { Grid, Typography } from "@mui/material";
import { ordersToOrderHistoryCardProps, useNavigate } from "../utils.ts";
import { Order, OrderStatus } from "../types/order.ts";
import OrderHistoryCard, { OrderHistoryCardProps } from "./OrderHistoryCard.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { useLocation } from "react-router-dom";


export interface OrdersHistoryProps {
  title?: string;
  subtitle?: string;
  noTitle?: boolean;
  mode?: OrderStatus[];
}


const Skeleton = () => {
  return (
    <div className={`pl-4 lg:pl-0 h-full min-w-80 `}>
      <div className="w-full rounded-2xl overflow-hidden">
        <div className="bg-gray-300 animate-pulse h-full w-full aspect-square" />
      </div>

      <div className="mt-4 py-4 flex flex-col justify-between">
        <div className="flex">
          <div className="flex flex-col flex-1 h-full min-h-40 space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded w-1/4 mt-4 animate-pulse" />
          </div>
          <div className="flex flex-col items-end justify-between max-w-[50px] ml-4">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersHistory: React.FC<OrdersHistoryProps> = ({ title = "Opere acquistate", noTitle, mode = ["completed"] }) => {
  const data = useData();
  const location = useLocation().pathname;
  const navigate = useNavigate();
  const snackbar = useSnackbars();

  const [orders, setOrders] = useState<OrderHistoryCardProps[]>();
  const [rawOrders, setRawOrders] = useState<Order[]>([]);

  // Determina se usare 3 colonne (per pending/on-hold) o 2 colonne
  const useThreeColumns = mode.includes("pending") || mode.includes("on-hold") || mode.includes("failed") || mode.includes("cancelled");

  const handleClick = async (orderId: number) => {
    // Trova l'ordine originale per controllare il created_via
    const order = rawOrders.find(o => o.id === orderId);

    if (order?.created_via === "gallery_auction") {
      navigate(`/acquisto-esterno?order=${orderId}`);
    } else if (order?.created_via === "artpay_deposit_api") {
      navigate(`/saldo-opera/${orderId}`);
    } else {
      navigate(`/completa-acquisto/${orderId}`);
    }
  };

  const handleCompletedClick = async (orderId: number) => {
    navigate(`/complete-order/${orderId}`);
  };

  const showCta = (purchaseMode: string, status: OrderStatus): boolean => {
    if ((status === "on-hold" && purchaseMode !== "Stripe SEPA") || (status === "pending" && purchaseMode !== "Stripe SEPA") || (status === "processing" && purchaseMode !== "Stripe SEPA")) {
      return true;
    }
    return false;
  };

  const getClickHandler = (purchaseMode: string, status: OrderStatus): ((orderId: number) => Promise<void>) | undefined => {
    if (status === "completed") {
      return handleCompletedClick;
    }
    if (showCta(purchaseMode, status)) {
      return handleClick;
    }
    return undefined;
  };

  const loadOrders = async () => {
    try {
      const fetchedOrders = await data.listOrders({ status: mode, per_page: 10 });
      const filteredOrders = fetchedOrders.filter(o => !o.created_via.includes("mvx"));
      setRawOrders(filteredOrders);
      setOrders(ordersToOrderHistoryCardProps(filteredOrders));
    } catch (e) {
      snackbar.error(e);
    }
  };

  const handleRefreshOrders = async () => {
    await loadOrders();
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Calcola il padding in base al numero di colonne
  const getPadding = (index: number) => {
    if (useThreeColumns) {
      // 3 colonne: prima colonna pr, seconda pl+pr, terza pl
      const col = index % 3;
      return {
        pr: { xs: 0, md: col === 0 || col === 1 ? 1 : 0 },
        pl: { xs: 0, md: col === 1 || col === 2 ? 1 : 0 }
      };
    } else {
      // 2 colonne: prima colonna pr, seconda pl
      return {
        pr: { xs: 0, md: index % 2 === 0 ? 1.5 : 0 },
        pl: { xs: 0, md: index % 2 === 1 ? 1.5 : 0 }
      };
    }
  };

  return (
    <Grid justifyContent="stretch" container>
      {!noTitle && (
        <Grid xs={12} md={6} mb={3} pr={{ xs: 0, md: 1.5 }} item>
          <Typography sx={{ mb: 2 }} variant="h3">
            {title}
          </Typography>
        </Grid>
      )}
      <Grid xs={12}
            md={6} item />
      {orders && orders?.length > 0 ? (
        orders?.map((order, i) => {
          const padding = getPadding(i);
          return (
            <Grid
              key={`order-${i}`}
              xs={12}
              md={useThreeColumns ? 4 : 6}
              pr={padding.pr}
              pl={padding.pl}
              pb={3}
              item>
              <OrderHistoryCard
                {...order}
                onClick={getClickHandler(order.purchaseMode, order.status)}
                galleryName={order.galleryName}
                onQuoteAccepted={handleRefreshOrders}
                onQuoteRejected={handleRefreshOrders}
              />
            </Grid>
          );
        })
      ) : (
        <div>
          {orders?.length === 0 ? (
            <div className={'text-lg text-secondary'}>
              Non ci sono {location.endsWith('quotes') ? "offerte" : "transazioni"} per ora
            </div>
          ) : (
            <div className={"flex gap-8 my-12 overflow-x-hidden"}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i}  />
              ))}
            </div>
          )}
        </div>
      )}
    </Grid>
  );
};

export default OrdersHistory;



