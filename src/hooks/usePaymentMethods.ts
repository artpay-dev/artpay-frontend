import { useState, useEffect } from 'react';
import { useData } from '../hoc/DataProvider';
import { PaymentMethod, PaymentMethodsResponse } from '../types/order';

export const usePaymentMethods = () => {
  const data = useData();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Separa i metodi di pagamento
  const cardAndBankMethods = paymentMethods.filter(
    method => method.id === 'stripe' || method.id === 'bacs'
  );
  
  const klarnaMethods = paymentMethods.filter(
    method => method.id === 'klarna'
  );

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true);
        const response: PaymentMethodsResponse = await data.getAvailablePaymentMethods();
        
        // Filtra solo i metodi abilitati
        const enabledMethods = response.available_methods.filter(method => method.enabled);
        setPaymentMethods(enabledMethods);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch payment methods:', err);
        setError('Errore nel caricamento dei metodi di pagamento');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [data]);

  const createPaymentIntentForMethod = async (orderKey: string, methodId: string) => {
    try {
      // Usa updatePaymentIntent per applicare le fee specifiche del metodo
      const updatedPaymentIntent = await data.updatePaymentIntent({
        wc_order_key: orderKey,
        payment_method: methodId,
      });
      
      return updatedPaymentIntent;
    } catch (error) {
      console.error(`Failed to create payment intent for ${methodId}:`, error);
      throw error;
    }
  };

  return {
    paymentMethods,
    cardAndBankMethods,
    klarnaMethods,
    isLoading,
    error,
    createPaymentIntentForMethod,
  };
};