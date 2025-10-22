import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { Grid, Typography } from "@mui/material";
import { ordersToOrderHistoryCardProps, useNavigate } from "../utils.ts";
import { OrderStatus } from "../types/order.ts";
import OrderHistoryCard, { OrderHistoryCardProps } from "./OrderHistoryCard.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";

export interface OrdersHistoryProps {
  title?: string;
  subtitle?: string;
  noTitle?: boolean;
  mode?: "completed" | "on-hold" | "all";
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

const OrdersHistory: React.FC<OrdersHistoryProps> = ({ title = "Opere acquistate", noTitle }) => {
  const data = useData();
  const navigate = useNavigate();
  const snackbar = useSnackbars();

  const [orders, setOrders] = useState<OrderHistoryCardProps[]>();

  const handleClick = async (orderId: number) => {
    navigate(`/completa-acquisto/${orderId}`);
  };

  const showCta = (purchaseMode: string, status: OrderStatus): boolean => {
    if (status === "on-hold" && purchaseMode !== "Stripe SEPA") {
      return true;
    }
    return false;
  };

  useEffect(() => {
    data
      .listOrders({ status: ["processing", "completed"], per_page: 10 })
      .then((orders) => {
        setOrders(ordersToOrderHistoryCardProps(orders));
      })
      .catch((e) => snackbar.error(e));
  }, []);

  return (
    <Grid justifyContent="stretch" container>
      {!noTitle && (
        <Grid xs={12} md={6} mb={3} pr={{ xs: 0, md: 1.5 }} item>
          <Typography sx={{ mb: 2 }} variant="h3">
            {title}
          </Typography>
        </Grid>
      )}
      <Grid xs={12} item />
      {orders && orders?.length > 0 ? (
        orders?.map((order, i) => (
          <Grid
            key={`order-${i}`}
            xs={12}
            md={6}
            pr={{ xs: 0, md: i % 2 === 0 ? 1.5 : 0 }}
            pl={{ xs: 0, md: i % 2 === 1 ? 1.5 : 0 }}
            pb={3}
            item>
            <OrderHistoryCard {...order} onClick={showCta(order.purchaseMode, order.status) ? handleClick : undefined} />
          </Grid>
        ))
      ) : (
        <div>
          <div className={"flex gap-8 my-12 overflow-x-hidden"}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i}  />
            ))}
          </div>
        </div>
      )}
    </Grid>
  );
};

export default OrdersHistory;



