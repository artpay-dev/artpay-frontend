import React, { useEffect, useState } from "react";
import Logo from "../components/icons/Logo";
import Footer from "../components/Footer";
import thephairbg from "../assets/images/thephairbg.svg";
import fastpay1 from "../assets/images/features-fastpay.svg";
import fastpay2 from "../assets/images/features-fastpay-2.svg";
import fastpay3 from "../assets/images/features-fastpay-3.svg";
import fastpay4 from "../assets/images/features-fastpay-4.svg";
import coverKlarna from "../assets/images/cover_klarna.svg";
import santanderLogo from "../assets/images/santander_logo_1.svg";
import htsi from "../assets/images/HTSI.svg";

export interface HomeProps {}

const HomeThePhair: React.FC<HomeProps> = () => {
  const GALLERY_IDS = [206, 175, 137, 245, 108, 135];

  const [galleries, setGalleries] = useState<{ logo: string; title: string }[]>([]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || "";
    const normalizeUrl = (v: any): string | null => {
      if (typeof v !== "string" || !v) return null;
      if (v.startsWith("//")) return `https:${v}`;
      if (v.startsWith("http")) return v;
      return null;
    };
    Promise.all(
      GALLERY_IDS.map((id) =>
        fetch(`${baseUrl}/wp-json/mvx/v1/vendors/${id}`).then((r) => r.json())
      )
    )
      .then((results) => {
        const filtered = results
          .flatMap((g) => {
            const logo = normalizeUrl(g.shop?.image);
            return logo ? [{ logo, title: g.shop?.title || g.display_name }] : [];
          });
        setGalleries(filtered);
      })
      .catch(() => {});
  }, []);

  const removeGallery = (logo: string) =>
    setGalleries((prev) => prev.filter((g) => g.logo !== logo));

  return (
    <main className="w-full">

      {/* ── HERO ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6">
        <div
          className="relative rounded-3xl w-[95%] h-[90vh] overflow-hidden"
          style={{ backgroundImage: `url(${thephairbg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >

          {/* Contenuto */}
          <div className="relative z-10 flex flex-col h-full p-5 md:p-8">
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
                className="hidden md:block text-white text-sm underline-offset-4 hover:underline opacity-80 hover:opacity-100 transition-opacity"
              >
                Scopri tutto su artpay
              </a>
            </div>

            {/* Testo centrato */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl md:text-8xl text-white leading-none tracking-tight">Vendi l&apos;opera.<br />Incassa in pochi giorni.</h1>
              <p className="mt-8 md:mt-16 text-base md:text-lg max-w-xl text-white">
                Il collezionista paga in rate.<br />Tu incassi l&apos;intero importo in pochi giorni.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 md:mt-12 w-full sm:w-auto">
                <a href="#cta-gallerie" className="w-full sm:w-auto px-6 py-3 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors text-center">
                  Registra la tua galleria
                </a>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold transition-colors text-center"
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
      <section id="features" className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-40 bg-white">
        <div className="w-full flex flex-col items-center gap-16">

          {/* Intestazione */}
          <div className="text-center flex flex-col gap-3 max-w-5xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">Come funziona</span>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-[1.05] tracking-tight">Tre passi. Zero complessità.</h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

            {/* Card 1 — primary */}
            <div className="bg-primary rounded-2xl p-12 flex flex-col items-start text-left gap-8 min-h-[420px]">
              <h3 className="text-2xl font-semibold text-white leading-tight tracking-tight">Registra la tua galleria</h3>
              <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Crea il tuo account in meno di 15 minuti. Nessun documento cartaceo. <br />Il nostro team è disponibile per seguirti passo per passo durante l’attivazione.
              </p>
              <a href="#cta-gallerie" className="mt-auto px-5 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                Registra la tua galleria
              </a>
            </div>

            {/* Card 2 — grigia */}
            <div className="bg-gray-50 rounded-2xl p-12 flex flex-col items-start text-left gap-8 min-h-[420px]">
              <h3 className="text-2xl font-semibold text-gray-900 leading-tight tracking-tight">Proponi il pagamento rateale</h3>
              <p className="text-base text-gray-500 leading-relaxed">
                In fiera o in galleria, condividi un link o un QR code con artpay FAST. <br/>Il collezionista completa l’acquisto in autonomia. Tu hai visibilità in tempo reale sullo stato dell’offerta e della transazione.
              </p>
            </div>

            {/* Card 3 — grigia */}
            <div className="bg-gray-50 rounded-2xl p-12 flex flex-col items-start text-left gap-8 min-h-[420px]">
              <h3 className="text-2xl font-semibold text-gray-900 leading-tight tracking-tight">Incassa subito l'intero importo</h3>
              <p className="text-base text-gray-500 leading-relaxed">
                I nostri partner finanziari accreditano il 100% del valore dell’opera in pochi giorni dalla conferma. <br/>Il rischio di credito è interamente a carico dei partner finanziari, non della galleria.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── PROMO ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-40">
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
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 leading-[1.05] tracking-tight">
              Partner fintech The Phair 2026
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Il 22–25 maggio all’OGR di Torino. artpay è il partner fintech ufficiale dell’edizione 2026. <br/> <br/>

              Un appuntamento imperdibile dedicato alla fotografia e alle immagini contemporanee, capace di mettere in dialogo artisti, gallerie e pubblico internazionale. Saremo presenti per supportare l’innovazione nei pagamenti e contribuire a un’esperienza ancora più fluida e digitale.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="w-full flex flex-col items-center px-6 py-40 bg-gray-50">
        <div className="w-full max-w-6xl flex flex-col items-center gap-16">

          {/* Intestazione */}
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-[1.05] tracking-tight">Tutto in un posto
            </h2>
            <p className="text-base text-gray-500 max-w-xl mx-auto mt-2">
              Gestisci le opere, crea offerte per i clienti, tieni traccia di ogni vendita. Dall’app, in pochi secondi.
            </p>
          </div>

          {/* Step */}
          {(() => {
            const steps = [
              { img: fastpay1, label: "Accedi all’app" },
              { img: fastpay2, label: "Crea la tua offerta con tutti i dettagli" },
              { img: fastpay3, label: "Salva l’offerta" },
              { img: fastpay4, label: "Condividila con il cliente" },
            ];
            return (
              <>
                {/* Mobile: griglia 2 colonne */}
                <div className="grid grid-cols-2 gap-6 w-full md:hidden">
                  {steps.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 self-start">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-xs font-semibold text-gray-900 leading-tight">{item.label}</span>
                      </div>
                      <img src={item.img} alt={item.label} className="w-full h-auto object-contain" />
                    </div>
                  ))}
                </div>

                {/* Desktop: griglia 4 colonne con linee */}
                <div className="hidden md:grid w-full grid-cols-4 gap-0">
                  {steps.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-6">
                      <div className="relative w-full flex items-center justify-center">
                        {i > 0 && <div className="absolute left-0 right-1/2 h-0.5 bg-primary" />}
                        <div className="relative z-10 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {i + 1}
                        </div>
                        {i < steps.length - 1 && <div className="absolute left-1/2 right-0 h-0.5 bg-primary" />}
                      </div>
                      <img src={item.img} alt={item.label} className="w-full max-w-[220px] h-auto object-contain" />
                    </div>
                  ))}
                  {steps.map((item, i) => (
                    <span key={i} className="text-sm font-semibold text-gray-900 text-center px-4 pt-2">
                      {item.label}
                    </span>
                  ))}
                </div>
              </>
            );
          })()}

        </div>
      </section>






      {/* ── CTA GALLERIE ── */}
      <section id="cta-gallerie" className="w-full flex items-center justify-center px-6 py-40 bg-white">
        <div className="w-full max-w-5xl rounded-2xl bg-gray-900 px-12 py-16 flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Testo + bullet */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight tracking-tight">Inizia oggi</h2>
              <p className="text-gray-400 text-base max-w-md">
                Unisciti alle gallerie che già usano artpay per vendere di più e incassare in pochi giorni, senza rischi.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                "3 mesi gratuiti, poi €29/mese",
                "Commissione al 6% per i primi 12 mesi",
                "Nessun rinnovo automatico dopo i 3 mesi",
                "Nessun rischio di credito per la galleria",
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
      <section className="w-full flex flex-col items-center justify-center px-6 py-40 bg-white">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Testo sx */}
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-[1.05] tracking-tight">
              Oltre 25 Gallerie in Italia
            </h2>
            <p className="text-base text-gray-500 leading-relaxed max-w-md">
              25 gallerie usano già artpay. Da Milano a Torino, da gallerie emergenti a spazi con vent’anni di storia.
            </p>
          </div>

          {/* Griglia loghi dx */}
          <div className="grid grid-cols-2 gap-4">
            {galleries.length > 0
              ? galleries.map((g) => (
                  <div key={g.logo} className="relative aspect-[16/9] rounded-xl bg-white border border-gray-100 flex items-center justify-center p-4 group overflow-hidden">
                    <img
                      src={g.logo}
                      alt={g.title}
                      className="w-full h-full object-contain"
                      onError={() => removeGallery(g.logo)}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <span className="text-white text-xs font-semibold leading-tight line-clamp-2">{g.title}</span>
                    </div>
                  </div>
                ))
              : [0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-[16/9] rounded-xl bg-gray-100 animate-pulse" />
                ))}
          </div>

        </div>
      </section>


      {/* ── PARTNER ── */}
      <section className="w-full flex flex-col items-center justify-center px-6 py-32 bg-white">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Sx — testo */}
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">I nostri partner</span>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-[1.05] tracking-tight">
              Partner finanziari
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Lavoriamo con istituzioni finanziarie selezionate, tra cui Santander e Klarna, per garantire liquidità immediata alla galleria su ogni transazione.
            </p>
          </div>

          {/* Dx — due loghi affiancati */}
          <div className="flex flex-row gap-6">
            <div className="flex-1 rounded-2xl flex items-center justify-center p-10 aspect-[4/3]" style={{ backgroundColor: "#EA1D25" }}>
              <img src={santanderLogo} alt="Santander" className="w-full max-w-[180px] h-auto brightness-0 invert" />
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden aspect-[4/3]">
              <img src={coverKlarna} alt="Klarna" className="w-full h-full object-cover" />
            </div>
          </div>

        </div>
      </section>

      {/* ── HTSI ── */}
      <section className="w-full flex flex-col items-center justify-center px-6 py-32 bg-white">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Sx — testo */}
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">Riconoscimenti</span>
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 leading-[1.05] tracking-tight">
              Best Luxury Startup 2025 <br/> <span className={'text-gray-400'}>How to Spend It — Il Sole 24 Ore</span>
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