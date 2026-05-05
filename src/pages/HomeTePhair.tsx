import React from "react";
import Logo from "../components/icons/Logo";

export interface HomeProps {}

const HomeThePhair: React.FC<HomeProps> = () => {
  return (
    <main className="w-full">

      {/* ── HERO ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6">
        <div
          className="relative rounded-3xl w-[95%] h-[90vh] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #793CE4 0%, #4414CE 50%, #4070DC 100%)" }}
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
              <h1 className="text-5xl md:text-7xl text-white">Vendi l'opera.<br /> Incassa Subito.</h1>
              <p className="mt-24 text-lg max-w-xl" style={{ color: "rgba(255,255,255,0.7)" }}>
                artpay permette ai collezionisti di acquistare rate mensili.
                La galleria riceve il pagamento integrale il giorno stesso della vendita.
              </p>
              <div className="flex items-center gap-4 mt-16">
                <button className="px-6 py-3 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Registra la tua galleria
                </button>
                <button
                  className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.4)",
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  Scopri come funziona
                </button>
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
              <h3 className="text-xl font-semibold text-white">Registra la tua galleria</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Crea il tuo account in meno di 15 minuti. <br /> Il processo di verifica è semplice, veloce e completamente digitale.
              </p>
              <button className="mt-auto px-5 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                Registra la tua galleria
              </button>
            </div>

            {/* Card 2 — grigia */}
            <div className="bg-gray-50 rounded-2xl p-12 flex flex-col items-start text-left gap-8 min-h-[420px]">
              <h3 className="text-xl font-semibold text-gray-900">Proponi il pagamento rateale</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Al momento della vendita, offri al collezionista la possibilità di pagare in rate mensili tramite artpay.
              </p>
            </div>

            {/* Card 3 — grigia */}
            <div className="bg-gray-50 rounded-2xl p-12 flex flex-col items-start text-left gap-8 min-h-[420px]">
              <h3 className="text-xl font-semibold text-gray-900">Incassa subito l'intero importo</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Artpay ti accredita il 100% del valore dell'opera entro 24 ore dalla conferma. Il rischio di credito è nostro.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── PROMO ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-24 bg-gray-50">
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
              Titolo della promozione
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Testo descrittivo della promo. Spiega il vantaggio principale in modo chiaro e diretto.
            </p>
          </div>
        </div>
      </section>

      {/* ── GALLERY / OPERE ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 bg-gray-50">
        <div className="max-w-5xl w-full">
          <h2 className="text-4xl font-light mb-12">Le opere</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6">
        <div className="max-w-xl w-full text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl font-light">Pronto a partecipare?</h2>
          <p className="text-gray-500">
            Testo di supporto alla call to action.
          </p>
          <button className="px-8 py-4 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            Scopri di più
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center px-6 bg-gray-900 text-white">
        <div className="max-w-4xl w-full flex flex-col gap-12">
          <h2 className="text-4xl font-light">The Phair</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-400">
            <div className="flex flex-col gap-3">
              <span className="text-white font-medium">Sezione</span>
              <span>Link</span>
              <span>Link</span>
              <span>Link</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white font-medium">Sezione</span>
              <span>Link</span>
              <span>Link</span>
              <span>Link</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white font-medium">Sezione</span>
              <span>Link</span>
              <span>Link</span>
              <span>Link</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-white font-medium">Sezione</span>
              <span>Link</span>
              <span>Link</span>
              <span>Link</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">© 2026 The Phair — Tutti i diritti riservati</p>
        </div>
      </section>

    </main>
  );
};

export default HomeThePhair;