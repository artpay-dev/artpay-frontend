import DefaultLayout from "../components/DefaultLayout.tsx";
import cover_klarna from "../assets/images/cover_klarna.svg";
import { useNavigate } from "react-router-dom";

const KlarnaPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <DefaultLayout>
      <section className={"mt-28  h-full px-8 lg:mx-auto lg:max-w-5xl lg:px-0 lg:mt-36"}>
        <button className={"underline cursor-pointer self-start mb-14 "} onClick={handleBack}>
          Torna indietro
        </button>
        <article className={"leading-[125%] pb-24"}>
          <header className={"space-y-4 flex flex-col mb-10 lg:px-40"}>
            <span className={"text-primary uppercase"}>Guide</span>
            <h1 className={"text-balance text-3xl"}>
              L’arte che ami, subito tua. In tutta libertà grazie ad artpay e Klarna
            </h1>
          </header>
          <p className={"leading-[125%] lg:px-40"}>
            Acquistare arte dovrebbe essere un’esperienza <strong>emozionante</strong>, non un ostacolo. Grazie alla partnership tra <strong>artpay e Klarna</strong>, puoi ottenere subito l’opera che desideri e pagare in modo flessibile, senza complicazioni.
          </p>
          <p className={"text-secondary text-sm mt-10 mb-16 lg:px-40"}>9 giugno 2025 - 1 minuto di lettura</p>
          <main>
            <img
              src={cover_klarna}
              width={600}
              height={400}
              alt="Klarna Logo"
              className="w-full h-full aspect-video object-cover rounded"
            />
            <section className={"space-y-6 leading-[125%] text-balance mt-10 lg:px-40"}>
              <ul className={"space-y-4"}>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-0 before:-left-2 before:text-3xl ps-4 leading-[115%] md:max-w-sm md:before:top-0'
                  }>
                  Scegli la tua opera d’arte presso una galleria o una casa d’aste partner.
                </li>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-2 before:-left-2 before:text-3xl ps-4 leading-[115%] md:max-w-sm md:before:top-0'
                  }>
                  Seleziona Klarna come metodo di pagamento per suddividere l’importo in più rate.
                </li>
                <li
                  className={
                    'before:text-[#6576EE] before:content-["•"] relative before:absolute before:top-2 before:-left-2 before:text-3xl ps-4 leading-[115%] md:max-w-sm md:before:top-0'
                  }>
                  Goditi subito la tua opera, mentre Klarna gestisce il pagamento in modo sicuro.
                </li>
              </ul>
              <p className={"leading-[125%] text-balance lg:mt-8"}><strong>Senza burocrazia, senza attese. Solo la libertà di acquistare arte con più serenità.</strong></p>
            </section>
          </main>
        </article>
      </section>
    </DefaultLayout>
  );
};

export default KlarnaPage;
