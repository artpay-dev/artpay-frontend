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
  mode?: "completed" | "on-hold" | "all";
}

const OrdersHistory: React.FC<OrdersHistoryProps> = ({
                                                       title = "Opere acquistate"
                                                     }) => {
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

      data.listOrders({ status: ["processing", "completed", ], per_page: 10 }).then((orders) => {
        setOrders(ordersToOrderHistoryCardProps(orders));
      }).catch(e => snackbar.error(e));

  }, []);


  return (
    <Grid justifyContent="stretch" container>
      <Grid xs={12} md={6} mb={3} pr={{ xs: 0, md: 1.5 }} item>
        <Typography sx={{ mb: 2 }} variant="h3">
          {title}
        </Typography>
      </Grid>
      <Grid xs={12} item />
      {orders?.map((order, i) => (
        <Grid key={`order-${i}`} xs={12} md={6} pr={{ xs: 0, md: i % 2 === 0 ? 1.5 : 0 }}
              pl={{ xs: 0, md: i % 2 === 1 ? 1.5 : 0 }} pb={3} item>
          <OrderHistoryCard {...order} onClick={showCta(order.purchaseMode, order.status) ? handleClick : undefined} />
        </Grid>
      ))}
    </Grid>
  );
};

export default OrdersHistory;
