import { useState, useCallback, useMemo } from "react";
import { PaymentFlowStep } from "../types.ts";

export const useStepFlow = (initialStep = PaymentFlowStep.INSTRUCTIONS, orderNote?: string) => {
  // Determine initial step based on order note
  const getInitialStep = useCallback(() => {
    if (orderNote === "Documentazione caricata, in attesa di conferma da artpay" || 
        orderNote === "Bonifico ricevuto") {
      return PaymentFlowStep.CONFIRMATION;
    }
    return initialStep;
  }, [initialStep, orderNote]);

  const [currentStep, setCurrentStep] = useState<PaymentFlowStep>(getInitialStep());

  const goToStep = useCallback((step: PaymentFlowStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = prev + 1;
      return next <= PaymentFlowStep.CONFIRMATION ? next : prev;
    });
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => {
      const previous = prev - 1;
      return previous >= PaymentFlowStep.INSTRUCTIONS ? previous : prev;
    });
  }, []);

  const isFirstStep = useMemo(() => currentStep === PaymentFlowStep.INSTRUCTIONS, [currentStep]);
  const isLastStep = useMemo(() => currentStep === PaymentFlowStep.CONFIRMATION, [currentStep]);

  const stepInfo = useMemo(() => ({
    current: currentStep,
    total: Object.keys(PaymentFlowStep).length / 2, // Enum has both string and number keys
    progress: (currentStep / PaymentFlowStep.CONFIRMATION) * 100
  }), [currentStep]);

  return {
    currentStep,
    stepInfo,
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    previousStep
  };
};