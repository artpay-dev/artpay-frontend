import { useEffect, useState } from "react";
import { getPaymentStatus, PaymentStatus } from "@/services/depositPayment.ts";
import { Button, Card, CardContent, CircularProgress, Divider, Grid, Paper, Typography } from "@mui/material";

const DepositPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Payment state
  const [orderId, setOrderId] = useState<number | null>(null);

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

  // Check URL parameters on page load for payment redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectStatus = urlParams.get('redirect_status');
    const paymentIntent = urlParams.get('payment_intent');
    const paymentType = urlParams.get('payment_type');

    if (redirectStatus === 'succeeded' && paymentIntent) {
      // Restore order data from localStorage
      const savedOrderData = localStorage.getItem('deposit-test-order');
      if (savedOrderData) {
        const orderData = JSON.parse(savedOrderData);
        setOrderId(orderData.orderId);

        // Determine which payment succeeded
        if (paymentType === 'balance') {
          setSuccess('Balance paid successfully! The order is now fully paid.');
        } else {
          setSuccess('Deposit paid successfully! You can now proceed to create the balance payment.');
        }

        // Fetch payment status
        getPaymentStatus(orderData.orderId)
          .then((response) => {
            if (response.success) {
              setPaymentStatus(response.data);
            }
          })
          .catch((err) => {
            console.error('Error fetching payment status:', err);
          });
      }

      // Clear URL parameters
      window.history.replaceState({}, '', window.location.pathname);
    } else if (redirectStatus === 'failed') {
      window.history.replaceState({}, '', window.location.pathname);
      setError('Payment failed. Please try again.');
    }
  }, []);


  const handleGetPaymentStatus = async () => {
    if (!orderId) return;

    setError(null);
    setLoading(true);

    try {
      const response = await getPaymentStatus(orderId);

      if (response.success) {
        setPaymentStatus(response.data);
        setSuccess('Payment status retrieved successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get payment status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 4: Check Payment Status
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={handleGetPaymentStatus}
            disabled={!orderId || loading}>
            {loading ? <CircularProgress size={24} /> : 'Get Payment Status'}
          </Button>

          {paymentStatus && (
            <Paper sx={{ mt: 3, p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Order Status
              </Typography>
              <Typography variant="body2">
                <strong>Order ID:</strong> {paymentStatus.order_id}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {paymentStatus.order_status}
              </Typography>
              <Typography variant="body2">
                <strong>Total:</strong> {paymentStatus.order_total} {paymentStatus.currency}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Deposit
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> {paymentStatus.deposit.amount} {paymentStatus.currency}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {paymentStatus.deposit.status}
              </Typography>
              {paymentStatus.deposit.paid_at && (
                <Typography variant="body2">
                  <strong>Paid At:</strong> {paymentStatus.deposit.paid_at}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Balance
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> {paymentStatus.balance.amount} {paymentStatus.currency}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {paymentStatus.balance.status}
              </Typography>
              {paymentStatus.balance.paid_at && (
                <Typography variant="body2">
                  <strong>Paid At:</strong> {paymentStatus.balance.paid_at}
                </Typography>
              )}
            </Paper>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default DepositPage;