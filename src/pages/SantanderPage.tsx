import DefaultLayout from "../components/DefaultLayout.tsx";
import cover_santander from "../assets/images/cover_santander.svg";
import { useNavigate } from "react-router-dom";

const SantanderPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <DefaultLayout hasNavBar={false}>
      <section className={"mt-28  h-full px-8 lg:mx-auto lg:max-w-5xl lg:px-0 lg:mt-36"}>
        <button className={"underline cursor-pointer self-start mb-14 "} onClick={handleBack}>
          Torna indietro
        </button>
        <article className={"leading-[125%] pb-24"}>
          <header className={"space-y-4 flex flex-col mb-10 lg:px-40"}>
            <span className={"text-primary uppercase"}>Guide</span>
            <h1 className={"text-balance text-3xl"}>
              Acquista con serenità, paga con flessibilità
            </h1>
          </header>
          <p className={"leading-[125%] lg:px-40"}>
            Da oggi, grazie alla collaborazione tra <strong>artpay e Santander</strong>, puoi concludere i tuoi acquisti in asta con la tranquillità di un pagamento su misura. Il nostro sistema ti permette di finalizzare la transazione in modo <strong>rapido e sicuro</strong>, scegliendo la soluzione più adatta alle tue esigenze.
          </p>
          <p className={"text-secondary text-sm mt-10 mb-16 lg:px-40"}>9 giugno 2025 - 1 minuto di lettura</p>
          <main>
            <img
              src={cover_santander}
              width={600}
              height={400}
              alt="Santander Logo"
              className="w-full h-full aspect-video object-cover rounded"
            />
            <section className={"space-y-6 leading-[125%] text-balance mt-10 lg:px-40"}>
              <h2 className={"text-balance text-3xl mt-16 mb-10"}>Come funziona?</h2>
              <p className={"leading-[125%]"}>
                Santander è una delle principali istituzioni finanziarie a livello globale, specializzata in <strong>soluzioni di pagamento affidabili e su misura</strong>. Attraverso artpay, puoi accedere a un processo semplificato per completare il tuo acquisto direttamente dalla tua area riservata.
              </p>
              <h3 className={"text-2xl text-balance mt-10"}>
                Completa il tuo acquisto con bonifico Santander
              </h3>
              <p className={"leading-[125%]"}>
                Puoi finalizzare il pagamento effettuando un bonifico con Santander direttamente dall’area riservata.
              </p>
              <ul className={"space-y-4"}>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:-top-2.5 before:-left-2 before:text-3xl ps-4 leading-[115%] md:max-w-sm '
                  }>
                  Compila i moduli richiesti.
                </li>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-0 before:-left-2 before:text-3xl ps-4 leading-[115%] md:max-w-sm md:before:top-0'
                  }>
                  Effettua il bonifico inserendo manualmente i dati forniti.
                </li>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-0 before:-left-2 before:text-3xl ps-4 leading-[115%] md:max-w-sm md:before:top-0'
                  }>
                  Attendi la conferma dell’operazione che ti perverrà via mail.
                </li>
              </ul>
              <p className={"leading-[125%] text-balance lg:mt-8"}>Non appena il pagamento sarà autorizzato, riceverai una notifica e potrai concludere l’acquisto in tutta sicurezza.</p>
              <p className={"leading-[125%] text-balance lg:mt-8"}><strong>Se hai bisogno di assistenza, il nostro team è a tua disposizione.</strong></p>
            </section>
          </main>
        </article>
      </section>
    </DefaultLayout>
  );
};

export default SantanderPage;
