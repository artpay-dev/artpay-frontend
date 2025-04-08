import BankIcon from "../../../../components/icons/BankIcon.tsx";
import { Order } from "../../../../types/order.ts";
import { ChangeEvent, useRef, useState } from "react";
import { uploadFile } from "@uploadcare/upload-client";

const BankTransfer = ({ order }: { order: Order }) => {
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const amountRef = useRef(null);
  const bankAccountRef = useRef(null);
  const bankRef = useRef(null);
  const orderRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const [fileData, setFileData] = useState<File | null>(null);

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

      console.log(result);
    } catch (e) {
      console.error(e);
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
                  <button className={"text-secondary underline cursor-pointer block"} onClick={() => setStep(1)}>
                    Annulla conferma bonifico
                  </button>
                )}
              </li>
              <li
                className={`leading-5 border-l border-gray-200 pb-8 before:absolute before:content-["•"] ${
                  step == 2 ? "before:text-primary" : "before:text-secondary"
                } before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4`}>
                <strong>Step 2</strong>
                {step == 2 && (
                  <div>
                    <p>Carica la ricevuta della banca nel pannello</p>

                    <div className="flex items-center justify-center w-full mt-6">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#CDCFD3] rounded-lg cursor-pointer bg-white hover:bg-gray-100 ">
                        {!fileData ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="mb-1 text-secondary">Ricevuta (JPG, PNG, PDF)</p>
                            <p className="text-primary underline font-normal">Carica file</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="mb-1 text-secondary">File caricato:</p>
                            <p className="mb-1 text-secondary font-semibold">{fileData.name}</p>
                            <p className="text-primary underline font-normal">Aggiorna file</p>
                          </div>
                        )}
                        <input id="dropzone-file" type="file" className="hidden" name={"file"} onChange={handleFile} />
                      </label>
                    </div>
                  </div>
                )}
                {step != 2 && <p className={"text-secondary"}>Ricevuta</p>}
              </li>
              <li
                className={
                  'leading-5 border-l border-gray-200 pb-8 before:absolute before:content-["•"] before:text-secondary before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4'
                }>
                <strong>Step 3</strong>
                <p className={"text-secondary"}>Completamento</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={"space-y-6 flex flex-col"}>
        {step == 1 && (
          <button
            className={"artpay-button-style bg-primary py-3! text-white disabled:opacity-65"}
            onClick={() => setStep(2)}>
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
            Completa operazione
          </button>
        )}
      </div>
    </section>
  );
};

export default BankTransfer;
