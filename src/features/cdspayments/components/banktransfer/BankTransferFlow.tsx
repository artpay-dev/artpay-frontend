import { useMemo, useCallback } from "react";
import BankIcon from "../../../../components/icons/BankIcon.tsx";
import { useStepFlow } from "./hooks/useStepFlow.ts";
import { useFileUpload } from "./hooks/useFileUpload.ts";
import { useData } from "../../../../hoc/DataProvider.tsx";
import usePaymentStore from "../../stores/paymentStore.ts";
import useToolTipStore from "../../stores/tooltipStore.ts";
import { sendBrevoEmail } from "../../utils.ts";
import CopyableField from "./components/CopyableField.tsx";
import FileUploadZone from "./components/FileUploadZone.tsx";
import StepIndicator from "./components/StepIndicator.tsx";
import { PaymentFlowStep, type PaymentFlowProps, type BankTransferConfig, type CopyableField as CopyableFieldType } from "./types.ts";

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
  onCancel, 
  onComplete, 
  config = DEFAULT_BANK_CONFIG 
}: PaymentFlowProps) => {
  const { setPaymentData, orderNote, user } = usePaymentStore();
  const { showToolTip } = useToolTipStore();
  const data = useData();
  
  const { currentStep, nextStep, goToStep } = useStepFlow(PaymentFlowStep.INSTRUCTIONS, orderNote);
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
      // Update order with note and billing info
      const updateOrder = await data.updateOrder(order.id, {
        customer_note: "Documentazione caricata, in attesa di conferma da artpay",
        billing: user?.billing?.invoice_type 
          ? user?.billing || user?.shipping
          : undefined,
      });

      if (!updateOrder) {
        throw new Error("Error updating order note");
      }

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

      // Update payment data
      setPaymentData({
        order: updateOrder,
        orderNote: "Documentazione caricata, in attesa di conferma da artpay",
      });

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
  }, [selectedFile, uploadSelectedFile, data, order, user, config, setPaymentData, nextStep, onComplete, showToolTip]);

  const renderStepActions = () => {
    switch (currentStep) {
      case PaymentFlowStep.INSTRUCTIONS:
        return (
          <div className="space-y-6">
            <button
              className="artpay-button-style bg-primary py-3! text-white disabled:opacity-65"
              onClick={handleConfirmTransfer}>
              Conferma bonifico
            </button>
            <button
              type="button"
              className="artpay-button-style py-3! disabled:opacity-65 disabled:cursor-not-allowed text-secondary"
              onClick={onCancel}>
              Annulla
            </button>
          </div>
        );

      case PaymentFlowStep.DOCUMENT_UPLOAD:
        return (
          <div className="space-y-6">
            <button
              type="button"
              disabled={isUploading || !selectedFile}
              className="artpay-button-style bg-primary py-3! text-white disabled:opacity-65 disabled:cursor-not-allowed"
              onClick={handleCompleteOperation}>
              {isUploading ? (
                <div className="size-4 border border-white border-b-transparent rounded-full animate-spin" />
              ) : (
                "Completa operazione"
              )}
            </button>
            <button
              type="button"
              className="artpay-button-style py-3! disabled:opacity-65 disabled:cursor-not-allowed text-secondary"
              onClick={onCancel}>
              Annulla
            </button>
          </div>
        );

      default:
        return null;
    }
  };


  return (
    <section>
      <div className="space-y-1 mb-6 relative">
        <h3 className="font-bold leading-[125%] text-tertiary">Completa pagamento</h3>
        <div className="mt-4 space-y-6">
          <div className="flex items-center space-x-2">
            <span className="-left-1 relative">
              <BankIcon />
            </span>
            <span>Bonifico Bancario</span>
          </div>
          
          <div>
            <StepIndicator 
              currentStep={currentStep}
              onStepClick={goToStep}
            />
            
            {/* Step Content */}
            {currentStep === PaymentFlowStep.INSTRUCTIONS && (
              <ul className="space-y-6 mt-6">
                {copyableFields.map((field, index) => (
                  <CopyableField key={index} field={field} />
                ))}
              </ul>
            )}
            
            {currentStep === PaymentFlowStep.DOCUMENT_UPLOAD && (
              <div className="mt-6">
                <FileUploadZone
                  selectedFile={selectedFile}
                  onFileSelect={handleFileUpload}
                  acceptedTypes={config.fileUpload.acceptedTypes}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step Actions */}
      <div className="space-y-6 flex flex-col">
        {renderStepActions()}
      </div>
    </section>
  );
};

export default BankTransferFlow;