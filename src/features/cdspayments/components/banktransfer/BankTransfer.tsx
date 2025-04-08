import BankIcon from "../../../../components/icons/BankIcon.tsx";
import { Order } from "../../../../types/order.ts";

const BankTransfer = ({order}: {order: Order}) => {
  return (
    <section>
      <div className={"space-y-1 mb-6"}>
        <h3 className={"font-bold leading-[125%] text-tertiary"}>Completa pagamento</h3>
        <div className={"mt-4 space-y-6"}>
          <label htmlFor="payment-method" className={"flex items-center justify-between"}>
            <div>
              <input type={"radio"} defaultChecked={true} className={"me-2"} />
              <span>Bonifico Bancario</span>
            </div>
            <span><BankIcon /></span>
          </label>
          <div>
            <ul className={"ps-1.5"}>
              <li className={'border-l border-gray-200 pb-8 before:absolute before:content-["•"] before:text-primary before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4'}>
                <strong>Step 1</strong>
                <p className={"text-secondary"}>Compila il bonifico inserendo i seguenti dati:</p>
                <ul>
                  <li>
                    <strong>Importo: € {order.total}</strong>
                    <p>Copia importo</p>
                  </li>
                </ul>

              </li>
              <li className={'border-l border-gray-200 pb-8 before:absolute before:content-["•"] before:text-secondary before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4'}>
                <strong>Step 2</strong>
                <p className={"text-secondary"}>Ricevuta</p>
              </li>
              <li className={'border-l border-gray-200 pb-8 before:absolute before:content-["•"] before:text-secondary before:text-3xl before:-left-4 before:translate-x-1/2 relative ps-4'}>
                <strong>Step 3</strong>
                <p className={"text-secondary"}>Completamento</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={"space-y-6 flex flex-col"}>
        <button className={"artpay-button-style bg-primary py-3! text-white disabled:opacity-65"}>
          Conferma bonifico
        </button>
      </div>
    </section>
  );
};

export default BankTransfer;