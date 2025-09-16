import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentIntent } from '@stripe/stripe-js';
import { usePayments } from '../hoc/PaymentProvider';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import PaymentCard from './PaymentCard';
import KlarnaCard from '../features/cdspayments/components/ui/klarnacard/KlarnaCard';

interface PaymentMethodSelectorProps {
  orderKey: string;
  onPaymentIntentReady?: (paymentIntent: PaymentIntent, method: string) => void;
  onPaymentMethodChange?: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  orderKey,
  onPaymentIntentReady,
  onPaymentMethodChange,
}) => {
  const payments = usePayments();
  const { cardAndBankMethods, klarnaMethods, isLoading, createPaymentIntentForMethod } = usePaymentMethods();
  
  const [selectedMethod, setSelectedMethod] = useState<string>('stripe');
  const [paymentIntents, setPaymentIntents] = useState<Record<string, PaymentIntent>>({});
  const [loadingIntents, setLoadingIntents] = useState<Record<string, boolean>>({});

  // Crea Payment Intent per il metodo selezionato
  const handleMethodSelection = async (methodId: string) => {
    if (paymentIntents[methodId]) {
      // Payment Intent già esistente
      setSelectedMethod(methodId);
      onPaymentMethodChange?.(methodId);
      onPaymentIntentReady?.(paymentIntents[methodId], methodId);
      return;
    }

    // Crea nuovo Payment Intent
    setLoadingIntents(prev => ({ ...prev, [methodId]: true }));
    
    try {
      const paymentIntent = await createPaymentIntentForMethod(orderKey, methodId);
      
      setPaymentIntents(prev => ({
        ...prev,
        [methodId]: paymentIntent,
      }));
      
      setSelectedMethod(methodId);
      onPaymentMethodChange?.(methodId);
      onPaymentIntentReady?.(paymentIntent, methodId);
    } catch (error) {
      console.error(`Failed to create payment intent for ${methodId}:`, error);
    } finally {
      setLoadingIntents(prev => ({ ...prev, [methodId]: false }));
    }
  };

  // Inizializza con il primo metodo disponibile
  useEffect(() => {
    if (cardAndBankMethods.length > 0 && !selectedMethod) {
      handleMethodSelection('stripe');
    }
  }, [cardAndBankMethods]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Sezione Carta e Bonifico */}
      {cardAndBankMethods.length > 0 && (
        <Box mb={3}>
          {loadingIntents['stripe'] ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            paymentIntents['stripe'] && (
              <PaymentCard
                paymentIntent={paymentIntents['stripe']}
                orderMode="purchase"
                paymentMethod={selectedMethod}
                onReady={(element) => {
                  console.log('Payment Element ready for stripe');
                }}
                onChange={(method) => {
                  console.log('Payment method changed:', method);
                }}
              />
            )
          )}
          
          {!paymentIntents['stripe'] && !loadingIntents['stripe'] && (
            <Box
              p={3}
              border="1px solid #e0e0e0"
              borderRadius={2}
              textAlign="center"
              sx={{ cursor: 'pointer' }}
              onClick={() => handleMethodSelection('stripe')}
            >
              <strong>Carta e Bonifico</strong>
              <p>Clicca per abilitare il pagamento con carta di credito o bonifico</p>
            </Box>
          )}
        </Box>
      )}

      {/* Sezione Klarna */}
      {klarnaMethods.length > 0 && (
        <Box>
          {selectedMethod === 'klarna' && paymentIntents['klarna'] ? (
            <Elements
              stripe={payments.stripe}
              options={{
                clientSecret: paymentIntents['klarna'].client_secret || undefined,
                loader: 'always',
              }}
            >
              <KlarnaCard
                paymentSelected={true}
                disabled={false}
              />
            </Elements>
          ) : (
            <Box
              p={3}
              border="1px solid #e0e0e0"
              borderRadius={2}
              textAlign="center"
              sx={{ 
                cursor: 'pointer',
                backgroundColor: loadingIntents['klarna'] ? '#f5f5f5' : 'white'
              }}
              onClick={() => !loadingIntents['klarna'] && handleMethodSelection('klarna')}
            >
              {loadingIntents['klarna'] ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <strong>Klarna - Paga in 3 rate</strong>
                  <p>Clicca per abilitare il pagamento rateale con Klarna</p>
                </>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PaymentMethodSelector;