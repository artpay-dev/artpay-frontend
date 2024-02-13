import React, { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { Grid, Typography } from "@mui/material";
import { ordersToOrderHistoryCardProps } from "../utils.ts";
import { OrderStatus } from "../types/order.ts";
import OrderHistoryCard, { OrderHistoryCardProps } from "./OrderHistoryCard.tsx";

export interface OrdersHistoryProps {
  orderStates?: OrderStatus[];
}

const OrdersHistory: React.FC<OrdersHistoryProps> = ({ orderStates = ["completed"] }) => {
  const data = useData();

  const [orders, setOrders] = useState<OrderHistoryCardProps[]>();

  useEffect(() => {
    data.listOrders({ status: orderStates, per_page: 10 }).then((orders) => {
      setOrders(ordersToOrderHistoryCardProps(orders));
    });
  }, [data]);

  return (
    <Grid sx={{ px: { xs: 0, sm: 3, md: 6 }, width: "100%" }} justifyContent="stretch" spacing={3} container>
      <Grid xs={12} mb={3} item>
        <Typography sx={{ mb: 2 }} variant="h3">
          Opere acquistate
        </Typography>
        <Typography variant="body1">
          Opere acquistateIn questa sezione trovi tutte le tue oper in via di acquisizione, potrai controllarne lo stato
          di avanzamento e verificare se le tue richieste di finanziamento sono state approvate
        </Typography>
      </Grid>
      {orders?.map((order, i) => (
        <Grid key={`order-${i}`} xs={12} md={6} item>
          <OrderHistoryCard {...order} />
        </Grid>
      ))}
    </Grid>
  );
};

export default OrdersHistory;
