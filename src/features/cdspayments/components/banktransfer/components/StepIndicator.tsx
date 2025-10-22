import { PaymentFlowStep } from "../types.ts";

interface StepIndicatorProps {
  currentStep: PaymentFlowStep;
  onStepClick?: (step: PaymentFlowStep) => void;
  className?: string;
}

const StepIndicator = ({ currentStep, onStepClick, className = "" }: StepIndicatorProps) => {
  return (
    <ul className={`ps-1.5 ${className}`}>
      {/* Step 1 */}
      <li className={`leading-5 border-l border-[#CDCFD3] pb-8 before:absolute before:content-["•"] ${
        currentStep === PaymentFlowStep.INSTRUCTIONS 
          ? "before:text-primary" 
          : currentStep > PaymentFlowStep.INSTRUCTIONS 
          ? "before:text-[#CDCFD3]" 
          : "before:text-[#CDCFD3]"
      } before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4`}>
        <strong className={`${currentStep >= PaymentFlowStep.INSTRUCTIONS ? '' : 'text-[#CDCFD3]'}`}>Step 1</strong>
        {currentStep === PaymentFlowStep.INSTRUCTIONS ? (
          <p className="text-secondary">Compila il bonifico inserendo i seguenti dati:</p>
        ) : currentStep > PaymentFlowStep.INSTRUCTIONS ? (
          <>
            <p>Compila il bonifico</p>
            {onStepClick && (
              <button
                className="text-secondary font-normal underline cursor-pointer block"
                onClick={() => onStepClick(PaymentFlowStep.INSTRUCTIONS)}>
                Annulla conferma bonifico
              </button>
            )}
          </>
        ) : (
          <p className="text-[#CDCFD3]">Compila il bonifico inserendo i seguenti dati:</p>
        )}
      </li>

      {/* Step 2 */}
      <li className={`leading-5 border-l border-[#CDCFD3] pb-8 before:absolute before:content-["•"] ${
        currentStep === PaymentFlowStep.DOCUMENT_UPLOAD 
          ? "before:text-primary" 
          : currentStep === PaymentFlowStep.CONFIRMATION 
          ? "before:text-[#CDCFD3]" 
          : "before:text-[#CDCFD3]"
      } before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4`}>
        <strong className={`${currentStep >= PaymentFlowStep.DOCUMENT_UPLOAD ? '' : 'text-[#CDCFD3]'}`}>Step 2</strong>
        {currentStep === PaymentFlowStep.DOCUMENT_UPLOAD ? (
          <p>Carica la ricevuta del bonifico effettuato</p>
        ) : currentStep === PaymentFlowStep.CONFIRMATION ? (
          <>
            <p>File caricato</p>
            {onStepClick && (
              <button
                className="underline font-normal text-secondary cursor-pointer"
                onClick={() => onStepClick(PaymentFlowStep.DOCUMENT_UPLOAD)}>
                Aggiorna documento
              </button>
            )}
          </>
        ) : (
          <p className="text-[#CDCFD3]">Ricevuta</p>
        )}
      </li>

      {/* Step 3 */}
      <li className={`${
        currentStep === PaymentFlowStep.CONFIRMATION ? "before:text-[#42B396]" : "before:text-[#CDCFD3]"
      } leading-5 before:absolute before:content-["•"] before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4`}>
        {currentStep === PaymentFlowStep.CONFIRMATION && (
          <span>
            <svg
              width="96"
              height="96"
              viewBox="0 0 96 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-12">
              <path
                d="M27.4109 74.8766H35.6761C36.4664 74.8766 37.125 75.1505 37.6519 75.6984L43.5462 81.5175C45.1268 83.1175 46.6141 83.9175 48.0081 83.9175C49.4021 83.9175 50.8894 83.1175 52.4702 81.5175L58.3313 75.6984C58.8803 75.1505 59.5498 74.8766 60.34 74.8766H68.6053C70.8666 74.8766 72.4911 74.3834 73.4788 73.397C74.4668 72.4108 74.9608 70.7889 74.9608 68.5313V60.2795C74.9608 59.5342 75.2242 58.8766 75.7509 58.3067L81.6123 52.422C83.2149 50.8437 84.0107 49.3642 83.9997 47.9835C83.9889 46.6028 83.1931 45.1124 81.6123 43.5123L75.7509 37.6274C75.2242 37.0575 74.9608 36.411 74.9608 35.6877V27.4357C74.9608 25.1781 74.4668 23.5507 73.4788 22.5535C72.4911 21.5562 70.8666 21.0576 68.6053 21.0576H60.34C59.5498 21.0576 58.8803 20.7946 58.3313 20.2686L52.4702 14.4494C50.8676 12.8056 49.3747 11.9891 47.9916 12.0001C46.6086 12.0111 45.1159 12.8275 43.5133 14.4494L37.6519 20.2686C37.125 20.7946 36.4664 21.0576 35.6761 21.0576H27.4109C25.1497 21.0576 23.5252 21.5508 22.5374 22.5371C21.5495 23.5234 21.0556 25.1562 21.0556 27.4357V35.6877C21.0556 36.411 20.7811 37.0575 20.2323 37.6274L14.4038 43.5123C12.8013 45.1124 12 46.6028 12 47.9835C12 49.3642 12.8013 50.8437 14.4038 52.422L20.2323 58.3067C20.7811 58.8766 21.0556 59.5342 21.0556 60.2795V68.5313C21.0556 70.7889 21.5495 72.4108 22.5374 73.397C23.5252 74.3834 25.1497 74.8766 27.4109 74.8766ZM44.5012 63.6326C44.2158 63.6326 43.9798 63.5834 43.7932 63.4848C43.6066 63.3863 43.4145 63.2164 43.2169 62.9751L33.3381 51.5012C33.2284 51.3479 33.1351 51.1835 33.0583 51.008C32.9814 50.8327 32.943 50.6465 32.943 50.4492C32.943 50.0986 33.0637 49.8082 33.3052 49.5779C33.5467 49.3479 33.8321 49.2328 34.1614 49.2328C34.4029 49.2328 34.6114 49.2767 34.787 49.3645C34.9627 49.452 35.1383 49.6054 35.3139 49.8247L44.4353 60.4765L60.9986 34.7014C61.3279 34.2411 61.7012 34.011 62.1184 34.011C62.4257 34.011 62.7111 34.1261 62.9745 34.3562C63.238 34.5863 63.3697 34.8658 63.3697 35.1945C63.3697 35.348 63.3368 35.5069 63.2709 35.6712C63.205 35.8356 63.1392 35.9836 63.0733 36.1151L45.7526 62.9751C45.5769 63.1944 45.3848 63.3588 45.1762 63.4683C44.9677 63.5779 44.7426 63.6326 44.5012 63.6326Z"
                fill="#42B396"
              />
            </svg>
          </span>
        )}
        <strong className={`${currentStep >= PaymentFlowStep.CONFIRMATION ? '' : 'text-[#CDCFD3]'}`}>Step 3</strong>
        {currentStep === PaymentFlowStep.CONFIRMATION ? (
          <p className="text-balance font-normal">
            Complimenti hai inviato con successo i documenti, ti aggiorneremo sui risultati!
          </p>
        ) : (
          <p className="text-[#CDCFD3]">Completamento</p>
        )}
      </li>
    </ul>
  );
};

export default StepIndicator;