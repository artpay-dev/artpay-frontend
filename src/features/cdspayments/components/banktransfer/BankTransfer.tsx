import BankIcon from "../../../../components/icons/BankIcon.tsx";
import { Order } from "../../../../types/order.ts";
import { ChangeEvent, useRef, useState } from "react";
import { uploadFile } from "@uploadcare/upload-client";
import useToolTipStore from "../../stores/tooltipStore.ts";
import usePaymentStore from "../../stores/paymentStore.ts";
import { useData } from "../../../../hoc/DataProvider.tsx";

const BankTransfer = ({ order }: { order: Order }) => {
  const {setPaymentData, orderNote, user} = usePaymentStore()

  const [step, setStep] = useState(orderNote == "Documentazione caricata, in attesa di conferma da artpay" || orderNote == "Bonifico ricevuto" ? 3 : 1);
  const data = useData()

  const [loading, setLoading] = useState(false);

  const amountRef = useRef(null);
  const bankAccountRef = useRef(null);
  const bankRef = useRef(null);
  const orderRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const [fileData, setFileData] = useState<File | null>(null);
  const { showToolTip } = useToolTipStore();


  const handleCopy = async (inputRef: React.RefObject<HTMLParagraphElement>) => {
    if (inputRef.current) {
      try {
        await navigator.clipboard.writeText(inputRef.current.innerText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Errore nella copia", err);
      }
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileData(e.target.files[0]);
      showToolTip({
        visible: true,
        message: "File caricato correttamente.",
      });
    }
  };

  const handleSubmit = async () => {
    if (!fileData) return;

    try {
      setLoading(true);
      const result = await uploadFile(fileData, {
        publicKey: "540a694a43b2050cb29c",
        store: "auto",
        metadata: {
          subsystem: "js-client",
        },
      });

      if (result.uuid) {
        showToolTip({
          visible: true,
          message: "Documenti inviati con sucesso.",
        });
        setStep(3);

        setPaymentData({
          orderNote: "Documentazione caricata, in attesa di conferma da artpay"
        })
        const updateOrder = data.updateOrder(order?.id, {
          customer_note: "Documentazione caricata, in attesa di conferma da artpay",
          billing: user?.billing.invoice_type ? user?.billing ? { ...user?.billing } : { ...user?.shipping } : undefined
        });
        if (!updateOrder) throw Error("Error updating order note");
        console.log("Order note updated");


      }

    } catch (e) {
      console.error(e);
      showToolTip({
        visible: true,
        message: "Errore durante l'invio.",
        type: "error"
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className={"space-y-1 mb-6 relative"}>
        <h3 className={"font-bold leading-[125%] text-tertiary"}>Completa pagamento</h3>
        {copied && <span className={"absolute right-0 top-0 -translate-y-full animate-pulse"}>Elemento copiato</span>}
        <div className={"mt-4 space-y-6"}>
          <label htmlFor="payment-method" className={"flex items-center justify-between"}>
            <div>
              <input type={"radio"} defaultChecked={true} className={"me-2"} />
              <span>Bonifico Bancario</span>
            </div>
            <span>
              <BankIcon />
            </span>
          </label>
          <div>
            <ul className={"ps-1.5"}>
              <li
                className={
                  'leading-5 border-l border-gray-200 pb-8 before:absolute before:content-["•"] before:text-primary before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4'
                }>
                <strong>Step 1</strong>
                {step == 1 && (
                  <div>
                    <p className={"text-secondary"}>Compila il bonifico inserendo i seguenti dati:</p>
                    <ul className={"space-y-6 mt-6"}>
                      <li className={"leading-5"}>
                        <span>
                          Intestato a: <br />
                          <strong ref={bankAccountRef}>artpay srl</strong>
                        </span>
                        <p
                          onClick={() => handleCopy(bankAccountRef)}
                          className={"text-primary underline font-normal cursor-pointer"}>
                          Copia intestatario
                        </p>
                      </li>
                      <li className={"leading-5"}>
                        <span>
                          Iban artpay: <br />
                          <strong ref={bankRef}>IT00A0000000000000000000000</strong>
                        </span>
                        <p
                          onClick={() => handleCopy(bankRef)}
                          className={"text-primary underline font-normal cursor-pointer"}>
                          Copia iban
                        </p>
                      </li>
                      <li className={"leading-5"}>
                        <strong>
                          Importo: € <span ref={amountRef}>{order.total}</span>
                        </strong>
                        <p
                          onClick={() => handleCopy(amountRef)}
                          className={"text-primary underline font-normal cursor-pointer"}>
                          Copia importo
                        </p>
                      </li>
                      <li className={"leading-5"}>
                        <strong>
                          Causale: <span ref={orderRef}>Ordine {order.id}</span>
                        </strong>
                        <p
                          onClick={() => handleCopy(orderRef)}
                          className={"text-primary underline font-normal cursor-pointer"}>
                          Copia causale
                        </p>
                      </li>
                    </ul>
                  </div>
                )}
                {step != 1 && (
                  <>
                    <p>Compila il bonifico</p>
                    <button className={"text-secondary font-normal underline cursor-pointer block"} onClick={() => setStep(1)}>
                      Annulla conferma bonifico
                    </button>
                  </>
                )}
              </li>
              <li
                className={`leading-5 border-l border-gray-200 pb-8 before:absolute before:content-["•"] ${
                  step > 1 ? "before:text-primary" : "before:text-secondary"
                } before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4`}>
                <strong>Step 2</strong>
                {step == 2 && (
                  <div>
                    <p>Carica la ricevuta della banca nel pannello</p>

                    <div className="flex items-center justify-center w-full mt-6">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-32 border border-[#CDCFD3] rounded-lg cursor-pointer bg-white hover:bg-gray-100 ">
                        {!fileData ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="mb-1 text-secondary">Ricevuta (JPG, PNG, PDF)</p>
                            <p className="text-primary underline font-normal">Carica file</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="mb-1 text-secondary">File caricato:</p>
                            <p className="mb-1 text-secondary font-semibold text-sm">{fileData.name}</p>
                            <p className="text-primary underline font-normal">Aggiorna file</p>
                          </div>
                        )}
                        <input id="dropzone-file" type="file" className="hidden" name={"file"} onChange={handleFile} />
                      </label>
                    </div>
                  </div>
                )}
                {step != 2 && step < 3 && <p className={"text-secondary"}>Ricevuta</p>}
                {step == 3 && (
                  <>
                    <p>File caricato</p>
                    <button className={'underline font-normal text-secondary cursor-pointer'} onClick={() => setStep(2)}>Aggiorna documento</button>
                  </>
                )}
              </li>
              <li
                className={`${step == 3 ? 'before:text-[#42B396]' : 'before:text-secondary' } leading-5 border-l border-gray-200 pb-8 before:absolute before:content-["•"] before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4`}>
                {step > 2 && (
                  <span>
                    <svg
                      width="96"
                      height="96"
                      viewBox="0 0 96 96"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={"size-12"}>
                      <path
                        d="M27.4109 74.8766H35.6761C36.4664 74.8766 37.125 75.1505 37.6519 75.6984L43.5462 81.5175C45.1268 83.1175 46.6141 83.9175 48.0081 83.9175C49.4021 83.9175 50.8894 83.1175 52.4702 81.5175L58.3313 75.6984C58.8803 75.1505 59.5498 74.8766 60.34 74.8766H68.6053C70.8666 74.8766 72.4911 74.3834 73.4788 73.397C74.4668 72.4108 74.9608 70.7889 74.9608 68.5313V60.2795C74.9608 59.5342 75.2242 58.8766 75.7509 58.3067L81.6123 52.422C83.2149 50.8437 84.0107 49.3642 83.9997 47.9835C83.9889 46.6028 83.1931 45.1124 81.6123 43.5123L75.7509 37.6274C75.2242 37.0575 74.9608 36.411 74.9608 35.6877V27.4357C74.9608 25.1781 74.4668 23.5507 73.4788 22.5535C72.4911 21.5562 70.8666 21.0576 68.6053 21.0576H60.34C59.5498 21.0576 58.8803 20.7946 58.3313 20.2686L52.4702 14.4494C50.8676 12.8056 49.3747 11.9891 47.9916 12.0001C46.6086 12.0111 45.1159 12.8275 43.5133 14.4494L37.6519 20.2686C37.125 20.7946 36.4664 21.0576 35.6761 21.0576H27.4109C25.1497 21.0576 23.5252 21.5508 22.5374 22.5371C21.5495 23.5234 21.0556 25.1562 21.0556 27.4357V35.6877C21.0556 36.411 20.7811 37.0575 20.2323 37.6274L14.4038 43.5123C12.8013 45.1124 12 46.6028 12 47.9835C12 49.3642 12.8013 50.8437 14.4038 52.422L20.2323 58.3067C20.7811 58.8766 21.0556 59.5342 21.0556 60.2795V68.5313C21.0556 70.7889 21.5495 72.4108 22.5374 73.397C23.5252 74.3834 25.1497 74.8766 27.4109 74.8766ZM44.5012 63.6326C44.2158 63.6326 43.9798 63.5834 43.7932 63.4848C43.6066 63.3863 43.4145 63.2164 43.2169 62.9751L33.3381 51.5012C33.2284 51.3479 33.1351 51.1835 33.0583 51.008C32.9814 50.8327 32.943 50.6465 32.943 50.4492C32.943 50.0986 33.0637 49.8082 33.3052 49.5779C33.5467 49.3479 33.8321 49.2328 34.1614 49.2328C34.4029 49.2328 34.6114 49.2767 34.787 49.3645C34.9627 49.452 35.1383 49.6054 35.3139 49.8247L44.4353 60.4765L60.9986 34.7014C61.3279 34.2411 61.7012 34.011 62.1184 34.011C62.4257 34.011 62.7111 34.1261 62.9745 34.3562C63.238 34.5863 63.3697 34.8658 63.3697 35.1945C63.3697 35.348 63.3368 35.5069 63.2709 35.6712C63.205 35.8356 63.1392 35.9836 63.0733 36.1151L45.7526 62.9751C45.5769 63.1944 45.3848 63.3588 45.1762 63.4683C44.9677 63.5779 44.7426 63.6326 44.5012 63.6326Z"
                        fill="#42B396"
                      />
                    </svg>
                  </span>
                )}
                <strong>Step 3</strong>
                {step == 3 ? (
                  <p className={'text-balance font-normal'}>Complimenti hai inviato con successo i documenti, ti aggiorneremo sui risultati!</p>
                ): (
                  <p className={"text-secondary"}>Completamento</p>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={"space-y-6 flex flex-col"}>
        {step == 1 && (
          <button
            className={"artpay-button-style bg-primary py-3! text-white disabled:opacity-65"}
            onClick={() => {
              setStep(2);
              showToolTip({
                visible: true,
                message: "Bonifico confermato",
              });
            }}>
            Conferma bonifico
          </button>
        )}
        {step == 2 && (
          <button
            type={"button"}
            disabled={loading || !fileData}
            className={
              "artpay-button-style bg-primary py-3! text-white disabled:opacity-65 disabled:cursor-not-allowed"
            }
            onClick={handleSubmit}>
            {loading ? (
              <div
                className="size-4 border border-white border-b-transparent rounded-full animate-spin"
                id="spinner"></div>
            ) : (
              "Completa operazione"
            )}
          </button>
        )}
      </div>
    </section>
  );
};

export default BankTransfer;
