import { useMemo, useCallback } from "react";
import { useStepFlow } from "./hooks/useStepFlow.ts";
import { useFileUpload } from "./hooks/useFileUpload.ts";
import { useData } from "../../../../hoc/DataProvider.tsx";
import useToolTipStore from "../../stores/tooltipStore.ts";
import { sendBrevoEmail } from "../../utils.ts";
import CopyableField from "./components/CopyableField.tsx";
import FileUploadZone from "./components/FileUploadZone.tsx";
import StepIndicator from "./components/StepIndicator.tsx";
import { PaymentFlowStep, type PaymentFlowProps, type BankTransferConfig, type CopyableField as CopyableFieldType } from "./types.ts";
import { useDirectPurchaseStore } from "../../../directpurchase";
import usePaymentStore from "../../stores/paymentStore.ts";

// Default configuration - can be overridden
const DEFAULT_BANK_CONFIG: BankTransferConfig = {
  bankName: "Artpay S.R.L.",
  iban: "IT40P0301503200000003833197",
  accountHolder: "artpay srl",
  fileUpload: {
    acceptedTypes: ["JPG", "PNG", "PDF"],
    maxSize: 10 * 1024 * 1024, // 10MB
    publicKey: "8a0960a7c6a499647503"
  },
  emailNotification: {
    toEmail: "giacomo@artpay.art",
    toName: "Team Artpay"
  }
};

const BankTransferFlow = ({
  order,
  user,
  onCancel,
  onComplete,
  onOrderUpdate,
  config = DEFAULT_BANK_CONFIG
}: PaymentFlowProps) => {
  const { showToolTip } = useToolTipStore();
  const data = useData();
  const { updatePageData } = useDirectPurchaseStore();
  const { refreshOrders } = usePaymentStore();

  // Determine initial step based on order status
  const getInitialStep = useCallback(() => {
    if (order.customer_note?.includes("Documentazione caricata")) {
      return PaymentFlowStep.CONFIRMATION;
    }
    return PaymentFlowStep.INSTRUCTIONS;
  }, [order.customer_note]);

  const { currentStep, nextStep, goToStep } = useStepFlow(getInitialStep(), "");
  const {
    selectedFile,
    isUploading,
    selectFile,
    uploadSelectedFile
  } = useFileUpload(config.fileUpload);


  // Bank transfer fields configuration
  const copyableFields: CopyableFieldType[] = useMemo(() => [
    {
      label: "Intestato a",
      value: config.accountHolder,
      copyText: "Copia intestatario"
    },
    {
      label: "Iban artpay",
      value: config.iban,
      copyText: "Copia iban"
    },
    {
      label: "Importo",
      value: `€ ${order.total}`,
      copyText: "Copia importo"
    },
    {
      label: "Causale",
      value: `Ordine ${order.id}`,
      copyText: "Copia causale",
      warning: "Attenzione! In assenza della causale corretta potrebbero verificarsi complicazioni."
    }
  ], [config, order]);

  const handleConfirmTransfer = useCallback(() => {
    nextStep();
    showToolTip({
      visible: true,
      message: "Bonifico confermato"
    });
  }, [nextStep, showToolTip]);

  const handleFileUpload = useCallback((file: File) => {
    return selectFile(file);
  }, [selectFile]);

  const handleCompleteOperation = useCallback(async () => {
    if (!selectedFile) return;

    const uploadedFile = await uploadSelectedFile();
    if (!uploadedFile) return;

    try {
      // Update order with note, status, and billing info
      const updatedOrder = await data.updateOrder(order.id, {
        status: "processing",
        customer_note: "Documentazione caricata, in attesa di conferma da artpay",
        billing: user?.billing?.invoice_type
          ? user?.billing || user?.shipping
          : undefined,
      });

      if (!updatedOrder) {
        throw new Error("Error updating order note");
      }

      // Update local state
      updatePageData({ pendingOrder: updatedOrder });

      // Refresh orders in PaymentDraw
      refreshOrders();

      // Send email notification
      await sendBrevoEmail({
        toEmail: config.emailNotification.toEmail,
        toName: config.emailNotification.toName,
        params: {
          order: order.id,
          user: `${user?.first_name} ${user?.last_name}`,
          email: user?.email,
          fileName: uploadedFile.originalFilename,
          ...config.emailNotification.templateParams
        },
      });

      // Notify parent about order update
      onOrderUpdate?.(updatedOrder);

      nextStep();
      onComplete?.(uploadedFile);

    } catch (error) {
      console.error("Error completing operation:", error);
      showToolTip({
        visible: true,
        type: "error",
        message: "Errore durante l'invio."
      });
    }
  }, [selectedFile, uploadSelectedFile, data, order, user, config, onOrderUpdate, nextStep, onComplete, showToolTip, updatePageData, refreshOrders]);



  return (
    <section className="w-full p-2">
      <div className="space-y-1 mb-6 relative">
        <div className="mt-4 space-y-6">
          <div className="flex items-center justify-between space-x-2 border-b border-gray-950/20 w-full pb-6">
            <span className={'font-semibold'}>Bonifico Bancario</span>
            <svg width="42" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" fill="#C2C9FF" />
              <rect x="0.5" y="0.5" width="33" height="23" rx="3.5" stroke="#F9F7F6" />
              <g clip-path="url(#clip0_935_2)">
                <path
                  d="M16.9376 5.75784C16.9988 5.74206 17.0646 5.74993 17.1212 5.78128L23.1212 9.11461C23.2207 9.1699 23.2707 9.28566 23.2423 9.39586C23.2137 9.50614 23.114 9.58336 23.0001 9.58336H11.0001C10.8862 9.58336 10.7865 9.50614 10.7579 9.39586C10.7295 9.28566 10.7795 9.1699 10.879 9.11461L16.879 5.78128L16.9376 5.75784ZM11.9649 9.08336H22.0353L17.0001 6.28584L11.9649 9.08336Z"
                  fill="#010F22"
                />
                <path
                  d="M22.3333 17.5V18H11.6667V17.5H22.3333ZM22.5 17.3333V16.6667C22.5 16.5746 22.4254 16.5 22.3333 16.5H11.6667C11.5746 16.5 11.5 16.5746 11.5 16.6667V17.3333C11.5 17.4254 11.5746 17.5 11.6667 17.5V18C11.2985 18 11 17.7015 11 17.3333V16.6667C11 16.2985 11.2985 16 11.6667 16H22.3333C22.7015 16 23 16.2985 23 16.6667V17.3333C23 17.7015 22.7015 18 22.3333 18V17.5C22.4254 17.5 22.5 17.4254 22.5 17.3333Z"
                  fill="#010F22"
                />
                <path
                  d="M12.75 15.3334V10.6667C12.75 10.5286 12.8619 10.4167 13 10.4167C13.1381 10.4167 13.25 10.5286 13.25 10.6667V15.3334C13.25 15.4714 13.1381 15.5834 13 15.5834C12.8619 15.5834 12.75 15.4714 12.75 15.3334Z"
                  fill="#010F22"
                />
                <path
                  d="M16.75 15.3334V10.6667C16.75 10.5286 16.8619 10.4167 17 10.4167C17.1381 10.4167 17.25 10.5286 17.25 10.6667V15.3334C17.25 15.4714 17.1381 15.5834 17 15.5834C16.8619 15.5834 16.75 15.4714 16.75 15.3334Z"
                  fill="#010F22"
                />
                <path
                  d="M20.75 15.3334V10.6667C20.75 10.5286 20.8619 10.4167 21 10.4167C21.1381 10.4167 21.25 10.5286 21.25 10.6667V15.3334C21.25 15.4714 21.1381 15.5834 21 15.5834C20.8619 15.5834 20.75 15.4714 20.75 15.3334Z"
                  fill="#010F22"
                />
              </g>
            </svg>
          </div>
          
          <div>
            <StepIndicator 
              currentStep={currentStep}
              onStepClick={goToStep}
            />
            
            {/* Step Content */}
            {currentStep === PaymentFlowStep.INSTRUCTIONS && (
              <div>
                <ul className="space-y-6 mt-6">
                  {copyableFields.map((field, index) => (
                    <CopyableField key={index} field={field} />
                  ))}
                </ul>

                {/* Actions for Instructions step */}
                <div className="space-y-6 mt-8">
                  <button
                    className="artpay-button-style max-w-none! bg-primary py-3! text-white disabled:opacity-65"
                    onClick={handleConfirmTransfer}>
                    Conferma bonifico
                  </button>
                  <button
                    type="button"
                    className="artpay-button-style max-w-none! py-3! disabled:opacity-65 disabled:cursor-not-allowed text-secondary"
                    onClick={onCancel}>
                    Annulla
                  </button>
                </div>
              </div>
            )}

            {currentStep === PaymentFlowStep.DOCUMENT_UPLOAD && (
              <div>
                <div className="mt-6">
                  <FileUploadZone
                    selectedFile={selectedFile}
                    onFileSelect={handleFileUpload}
                    acceptedTypes={config.fileUpload.acceptedTypes}
                  />
                </div>

                {/* Actions for Document Upload step */}
                <div className="space-y-6 mt-8">
                  <button
                    type="button"
                    disabled={isUploading || !selectedFile}
                    className="artpay-button-style max-w-none! bg-primary py-3! text-white disabled:opacity-65 disabled:cursor-not-allowed"
                    onClick={handleCompleteOperation}>
                    {isUploading ? (
                      <div className="size-4 border border-white border-b-transparent rounded-full animate-spin" />
                    ) : (
                      "Completa operazione"
                    )}
                  </button>
                  <button
                    type="button"
                    className="artpay-button-style max-w-none! py-3! disabled:opacity-65 disabled:cursor-not-allowed text-secondary"
                    onClick={onCancel}>
                    Annulla
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

    </section>
  );
};

export default BankTransferFlow;