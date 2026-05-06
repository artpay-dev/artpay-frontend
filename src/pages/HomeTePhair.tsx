import React, { useEffect, useState } from "react";
import Logo from "../components/icons/Logo";
import Footer from "../components/Footer";
import thephairbg from "../assets/images/thephairbg.svg";
import fastpay1 from "../assets/images/features-fastpay.svg";
import fastpay2 from "../assets/images/features-fastpay-2.svg";
import fastpay3 from "../assets/images/features-fastpay-3.svg";
import fastpay4 from "../assets/images/features-fastpay-4.svg";
import coverKlarna from "../assets/images/cover_klarna.svg";
import coverSantander from "../assets/images/cover_santander.svg";
import htsi from "../assets/images/HTSI.svg";

export interface HomeProps {}

const HomeThePhair: React.FC<HomeProps> = () => {
  const [galleries, setGalleries] = useState<{ banner: string; title: string }[]>([]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || "";
    fetch(`${baseUrl}/wp-json/mvx/v1/vendors?page=1&per_page=50`)
      .then((r) => r.json())
      .then((data: any[]) => {
        const isUrl = (v: any) => typeof v === "string" && v.startsWith("http");
        const filtered = data
          .filter((g) => isUrl(g.shop?.banner))
          .slice(0, 12)
          .map((g) => ({ banner: g.shop.banner, title: g.shop.title || g.display_name }));
        setGalleries(filtered);
      })
      .catch(() => {});
  }, []);

  const removeGallery = (banner: string) =>
    setGalleries((prev) => prev.filter((g) => g.banner !== banner));

  return (
    <main className="w-full">

      {/* ── HERO ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6">
        <div
          className="relative rounded-3xl w-[95%] h-[90vh] overflow-hidden"
          style={{ backgroundImage: `url(${thephairbg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >

          {/* Contenuto */}
          <div className="relative z-10 flex flex-col h-full p-8">
            {/* Topbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ filter: "brightness(0) invert(1)" }}>
                  <Logo />
                </div>
                <span
                  className="text-white text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-md"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  Per le gallerie
                </span>
              </div>
              <a
                href="https://artpay.art"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-sm underline-offset-4 hover:underline opacity-80 hover:opacity-100 transition-opacity"
              >
                Scopri tutto su artpay
              </a>
            </div>

            {/* Testo centrato */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl md:text-8xl text-white">Vendi l'opera.<br /> Incassa Subito.</h1>
              <p className="mt-24 text-lg max-w-xl text-white" >
                artpay permette ai collezionisti di acquistare rate mensili.
                La galleria riceve il pagamento integrale il giorno stesso della vendita.
              </p>
              <div className="flex items-center gap-4 mt-16">
                <a href="#cta-gallerie" className="px-6 py-3 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Registra la tua galleria
                </a>
                <a
                  href="#features"
                  className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.4)",
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  Scopri come funziona
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-24 bg-white">
        <div className="w-full flex flex-col items-center gap-16">

          {/* Intestazione */}
          <div className="text-center flex flex-col gap-3 max-w-5xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">Come funziona</span>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">Tre passi. Zero complessità.</h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

            {/* Card 1 — primary */}
            <div className="bg-primary rounded-2xl p-12 flex flex-col items-start text-left gap-8 min-h-[420px]">
              <h3 className="text-2xl font-semibold text-white">Registra la tua galleria</h3>
              <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Crea il tuo account in meno di 15 minuti. <br /> Il processo di verifica è semplice, veloce e completamente digitale.
              </p>
              <a href="#cta-gallerie" className="mt-auto px-5 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                Registra la tua galleria
              </a>
            </div>

            {/* Card 2 — grigia */}
            <div className="bg-gray-50 rounded-2xl p-12 flex flex-col items-start text-left gap-8 min-h-[420px]">
              <h3 className="text-2xl font-semibold text-gray-900">Proponi il pagamento rateale</h3>
              <p className="text-base text-gray-500 leading-relaxed">
                Al momento della vendita, offri al collezionista la possibilità di pagare in rate mensili tramite artpay.
              </p>
            </div>

            {/* Card 3 — grigia */}
            <div className="bg-gray-50 rounded-2xl p-12 flex flex-col items-start text-left gap-8 min-h-[420px]">
              <h3 className="text-2xl font-semibold text-gray-900">Incassa subito l'intero importo</h3>
              <p className="text-base text-gray-500 leading-relaxed">
                Artpay ti accredita il 100% del valore dell'opera entro 24 ore dalla conferma. Il rischio di credito è nostro.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── PROMO ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-24 ">
        <div className="w-full rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2" style={{ backgroundColor: "rgb(224, 222, 216)" }}>
          {/* Immagine */}
          <div className="relative min-h-[400px] md:min-h-full">
            <img
              src="/thepahirpromo.png"
              alt="The Phair promo"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          {/* Testo */}
          <div className="flex flex-col justify-center gap-6 p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
              Partner fintech 2025 The Phair
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Siamo felici di essere il partner fintech per l’edizione 2026 di The Phair, che si terrà dal 22 al 26 maggio alle OGR di Torino. <br/> <br/>

              Un appuntamento imperdibile dedicato alla fotografia e alle immagini contemporanee, capace di mettere in dialogo artisti, gallerie e pubblico internazionale. Saremo presenti per supportare l’innovazione nei pagamenti e contribuire a un’esperienza ancora più fluida e digitale.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="w-full flex flex-col items-center px-6 py-24 bg-gray-50">
        <div className="w-full max-w-6xl flex flex-col items-center gap-16">

          {/* Intestazione */}
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">Una piattaforma
              semplice e potente
            </h2>
            <p className="text-base text-gray-500 max-w-xl mx-auto mt-2">
              Una dashboard intuitiva per gestire ogni transazione. Checkout integrato per un’esperienza senza attriti.
            </p>
          </div>

          {/* Step connessi */}
          {(() => {
            const steps = [
              { img: fastpay1, label: "Accedi all’app" },
              { img: fastpay2, label: "Crea la tua offerta con tutti i dettagli" },
              { img: fastpay3, label: "Salva l'offerta" },
              { img: fastpay4, label: "Condividila con il cliente" },
            ];
            return (
              <div className="w-full grid grid-cols-4 gap-0">
                {steps.map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-6">
                    {/* Pallino + linea connettiva */}
                    <div className="relative w-full flex items-center justify-center">
                      {i > 0 && <div className="absolute left-0 right-1/2 h-0.5 bg-primary" />}
                      <div className="relative z-10 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {i + 1}
                      </div>
                      {i < steps.length - 1 && <div className="absolute left-1/2 right-0 h-0.5 bg-primary" />}
                    </div>

                    {/* Immagine */}
                    <img src={item.img} alt={item.label} className="w-full max-w-[220px] h-auto object-contain" />
                  </div>
                ))}

                {/* Label row allineata */}
                {steps.map((item, i) => (
                  <span key={i} className="text-sm font-semibold text-gray-900 text-center px-4 pt-2">
                    {item.label}
                  </span>
                ))}
              </div>
            );
          })()}

        </div>
      </section>






      {/* ── CTA GALLERIE ── */}
      <section id="cta-gallerie" className="w-full flex items-center justify-center px-6 py-24 bg-white">
        <div className="w-full max-w-5xl rounded-2xl bg-gray-900 px-12 py-16 flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Testo + bullet */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl md:text-4xl font-semibold text-white">Inizia oggi</h2>
              <p className="text-gray-400 text-base max-w-md">
                Unisciti alle gallerie che già usano artpay per vendere di più e incassare subito, senza rischi.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                "Nessun costo di attivazione",
                "Onboarding completamente digitale",
                "Zero rischio di credito per la galleria",
                "Attivo in meno di 15 minuti",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                  <span className="text-primary text-lg leading-none">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Bottone */}
          <div className="shrink-0 flex items-center md:self-center">
            <a
              href="https://onboarding.artpay.art/register"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-8 py-5 bg-white text-gray-900 rounded-2xl text-base font-semibold hover:bg-gray-100 active:scale-95 transition-all whitespace-nowrap shadow-lg shadow-black/20"
            >
              Registra la tua galleria
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── GALLERY / GALLERIE ── */}
      <section className="w-full flex flex-col items-center justify-center px-6 py-24 bg-white">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Testo sx */}
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
              Oltre 25 Gallerie in Italia
            </h2>
            <p className="text-base text-gray-500 leading-relaxed max-w-md">
              Una rete consolidata di oltre 25 partner selezionati in tutta Italia che hanno scelto di lavorare con noi.
              Una struttura presente sul territorio, con processi collaudati e relazioni consolidate, pronta ad accogliere nuovi partner che condividono la nostra visione del mercato dell’arte.
            </p>
          </div>

          {/* Griglia immagini dx */}
          <div className="grid grid-cols-3 gap-4">
            {galleries.length > 0
              ? galleries.slice(0, 6).map((g) => (
                  <div key={g.banner} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 group">
                    <img
                      src={g.banner}
                      alt={g.title}
                      className="w-full h-full object-cover"
                      onError={() => removeGallery(g.banner)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-white text-sm font-semibold">{g.title}</span>
                    </div>
                  </div>
                ))
              : [0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-[4/3] rounded-lg bg-gray-200 animate-pulse" />
                ))}
          </div>

        </div>
      </section>


      {/* ── PARTNER ── */}
      <section className="w-full flex flex-col items-center justify-center px-6 pt-8 pb-16 bg-white">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Sx — testo */}
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">I nostri partner</span>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
              Partner finanziari strategici
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Collaboriamo con i principali player finanziari per garantire sicurezza e affidabilità in ogni transazione.
            </p>
          </div>

          {/* Dx — due loghi affiancati */}
          <div className="flex flex-row gap-6">
            <div className="flex-1 rounded-2xl overflow-hidden" style={{ backgroundColor: "#EA1D25" }}>
              <img src={coverSantander} alt="Santander" className="w-full h-auto object-cover" />
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden">
              <img src={coverKlarna} alt="Klarna" className="w-full h-auto object-cover" />
            </div>
          </div>

        </div>
      </section>

      {/* ── HTSI ── */}
      <section className="w-full flex flex-col items-center justify-center px-6 py-16 bg-white mb-24">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Sx — testo */}
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">Riconoscimenti</span>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
              Miglior Startup dell’Arte 2025 &nbsp;<span className={'text-gray-300'}>Il Sole 24 Ore</span>
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Siamo stati selezionati e premiati tra le migliori startup italiane dal Sole 24 Ore, a conferma della solidità del nostro modello e della visione innovativa che portiamo nel mercato dell’arte.
            </p>
          </div>

          {/* Dx — immagine HTSI */}
          <div className="rounded-2xl overflow-hidden">
            <img src={htsi} alt="HTSI" className="w-full h-auto object-cover" />
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer  />

    </main>
  );
};

export default HomeThePhair;