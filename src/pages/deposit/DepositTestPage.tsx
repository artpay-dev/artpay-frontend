import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import {
  prepareDeposit,
  payBalance,
  getPaymentStatus,
  PrepareDepositRequest,
  PaymentStatus,
} from '@/services/depositPayment';

// Test data
const DEFAULT_PRODUCT_ID = 4782;
const DEFAULT_BILLING_ADDRESS = {
  first_name: 'John',
  last_name: 'Doe',
  address_1: 'Via Roma 1',
  city: 'Milano',
  postcode: '20100',
  country: 'IT',
  email: 'john@example.com',
  phone: '1234567890',
};

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  type: 'deposit' | 'balance';
}

function PaymentForm({ onSuccess, onError, type }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/deposit-test?payment_type=${type}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || processing}
        sx={{ mt: 3 }}>
        {processing ? (
          <CircularProgress size={24} />
        ) : (
          `Pay ${type === 'deposit' ? 'Deposit' : 'Balance'}`
        )}
      </Button>
    </form>
  );
}

export default function DepositTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [productId, setProductId] = useState(DEFAULT_PRODUCT_ID.toString());
  const [quantity, setQuantity] = useState('1');
  const [depositType, setDepositType] = useState<'percentage' | 'fixed'>('percentage');
  const [depositValue, setDepositValue] = useState('30');

  // Payment state
  const [orderId, setOrderId] = useState<number | null>(null);
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  const [depositClientSecret, setDepositClientSecret] = useState<string | null>(null);
  const [balanceClientSecret, setBalanceClientSecret] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [depositPaid, setDepositPaid] = useState(false);
  const [balancePaid, setBalancePaid] = useState(false);

  const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

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
        setStripePublishableKey(orderData.stripePublishableKey);
        setDepositAmount(orderData.depositAmount);
        setBalanceAmount(orderData.balanceAmount);
        setTotalAmount(orderData.totalAmount);
        setCurrency(orderData.currency);

        // Determine which payment succeeded
        if (paymentType === 'balance') {
          setSuccess('Balance paid successfully! The order is now fully paid.');
          setBalanceClientSecret(null);
          setBalancePaid(true);
          setDepositPaid(true); // Also mark deposit as paid
        } else {
          setSuccess('Deposit paid successfully! You can now proceed to create the balance payment.');
          setDepositClientSecret(null);
          setDepositPaid(true);
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

  const handlePrepareDeposit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Reset payment states
    setDepositPaid(false);
    setBalancePaid(false);
    setDepositClientSecret(null);
    setBalanceClientSecret(null);
    setPaymentStatus(null);

    try {
      const requestData: PrepareDepositRequest = {
        products: [
          {
            product_id: parseInt(productId),
            quantity: parseInt(quantity),
          },
        ],
        billing_address: DEFAULT_BILLING_ADDRESS,
        deposit_type: depositType,
        deposit_value: parseFloat(depositValue),
      };

      const response = await prepareDeposit(requestData);

      if (response.success) {
        setOrderId(response.data.order_id);
        setStripePublishableKey(response.data.stripe_publishable_key);
        setDepositClientSecret(response.data.client_secret);
        setDepositAmount(response.data.deposit_amount);
        setBalanceAmount(response.data.balance_amount);
        setTotalAmount(response.data.total);
        setCurrency(response.data.currency);
        setSuccess(`Order created successfully! Order ID: ${response.data.order_id}`);

        // Save order data to localStorage for recovery after redirect
        localStorage.setItem('deposit-test-order', JSON.stringify({
          orderId: response.data.order_id,
          stripePublishableKey: response.data.stripe_publishable_key,
          depositAmount: response.data.deposit_amount,
          balanceAmount: response.data.balance_amount,
          totalAmount: response.data.total,
          currency: response.data.currency,
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare deposit');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBalance = async () => {
    if (!orderId) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await payBalance({ order_id: orderId });

      if (response.success) {
        setBalanceClientSecret(response.data.client_secret);
        setSuccess('Balance payment intent created! You can now pay the balance.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create balance payment');
    } finally {
      setLoading(false);
    }
  };

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

  const handleDepositPaymentSuccess = () => {
    setSuccess('Deposit paid successfully! You can now proceed to create the balance payment.');
    setDepositClientSecret(null);
    setDepositPaid(true);
    handleGetPaymentStatus();
  };

  const handleBalancePaymentSuccess = () => {
    setSuccess('Balance paid successfully! The order is now fully paid.');
    setBalanceClientSecret(null);
    setBalancePaid(true);
    handleGetPaymentStatus();
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const elementsOptions = {
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Deposit Payment Test Page
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Test the deposit + balance payment flow with Stripe integration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Step 1: Prepare Deposit */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 1: Prepare Deposit
              </Typography>
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  label="Product ID"
                  type="number"
                  fullWidth
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Deposit Type"
                  select
                  fullWidth
                  value={depositType}
                  onChange={(e) => setDepositType(e.target.value as 'percentage' | 'fixed')}
                  SelectProps={{ native: true }}
                  sx={{ mb: 2 }}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </TextField>
                <TextField
                  label={depositType === 'percentage' ? 'Deposit Percentage (%)' : 'Deposit Amount'}
                  type="number"
                  fullWidth
                  value={depositValue}
                  onChange={(e) => setDepositValue(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlePrepareDeposit}
                  disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Prepare Deposit'}
                </Button>
              </Box>

              {totalAmount && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2">
                    <strong>Order ID:</strong> {orderId}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total:</strong> {totalAmount} {currency}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Deposit:</strong> {depositAmount} {currency}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Balance:</strong> {balanceAmount} {currency}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Step 2: Pay Deposit */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 2: Pay Deposit
              </Typography>
              {depositPaid ? (
                <Alert severity="success">
                  Deposit paid successfully! Amount: {depositAmount} {currency}
                </Alert>
              ) : depositClientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ ...elementsOptions, clientSecret: depositClientSecret }}>
                  <PaymentForm
                    onSuccess={handleDepositPaymentSuccess}
                    onError={handlePaymentError}
                    type="deposit"
                  />
                </Elements>
              ) : (
                <Alert severity="info">Prepare a deposit first to enable payment</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Step 3: Pay Balance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 3: Create Balance Payment
              </Typography>
              {!depositPaid ? (
                <Alert severity="warning">You must pay the deposit first before creating the balance payment</Alert>
              ) : balancePaid ? (
                <Alert severity="success">
                  Balance paid successfully! Amount: {balanceAmount} {currency}
                  <br />
                  Order fully completed!
                </Alert>
              ) : (
                <>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handlePayBalance}
                    disabled={!orderId || loading || balanceClientSecret !== null}>
                    {loading ? <CircularProgress size={24} /> : 'Create Balance Payment'}
                  </Button>

                  {balanceClientSecret && stripePromise && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Pay Balance
                      </Typography>
                      <Elements stripe={stripePromise} options={{ ...elementsOptions, clientSecret: balanceClientSecret }}>
                        <PaymentForm
                          onSuccess={handleBalancePaymentSuccess}
                          onError={handlePaymentError}
                          type="balance"
                        />
                      </Elements>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Step 4: Payment Status */}
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
      </Grid>

      {/* Test Cards */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Stripe Test Cards
          </Typography>
          <Typography variant="body2">
            <strong>Success:</strong> 4242 4242 4242 4242
          </Typography>
          <Typography variant="body2">
            <strong>Failure:</strong> 4000 0000 0000 0002
          </Typography>
          <Typography variant="body2">
            <strong>3D Secure:</strong> 4000 0027 6000 3184
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
            Use any future expiry date and any 3-digit CVC
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}