import { useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Typography, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import guide_artpay_img from "../assets/images/Guide.svg";
import { PostGrid } from "../components/postGrid.tsx";
import NewsletterBig from "../components/NewsletterBig.tsx";

interface TutorialSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const tutorialSlides: TutorialSlide[] = [
  {
    id: "come-funziona",
    title: "Come funziona",
    description:
      "Acquista direttamente online con i principali metodi di pagamento… oppure scegli la rateizzazione con partner selezionati, come Santander.",
    image: guide_artpay_img,
    imageAlt: "Guide Artpay - Come funziona",
  },
  {
    id: "esplora-gallerie",
    title: "Esplora le gallerie",
    description: "Scopri migliaia di opere d'arte contemporanea dalle migliori gallerie italiane e internazionali.",
    image: guide_artpay_img,
    imageAlt: "Guide Artpay - Esplora gallerie",
  },
  {
    id: "salva-preferiti",
    title: "Salva i tuoi preferiti",
    description:
      "Crea la tua collezione personale salvando le opere che più ti ispirano e tieni traccia dei tuoi artisti preferiti.",
    image: guide_artpay_img,
    imageAlt: "Guide Artpay - Salva preferiti",
  },
  {
    id: "acquista-sicuro",
    title: "Acquista in sicurezza",
    description:
      "Tutti i pagamenti sono protetti e certificati. Ricevi le tue opere comodamente a casa con spedizione assicurata.",
    image: guide_artpay_img,
    imageAlt: "Guide Artpay - Acquista sicuro",
  },
];

const Tutorials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % tutorialSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + tutorialSlides.length) % tutorialSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <DefaultLayout hasNavBar={true}>
      <div className={"flex gap-6 flex-col mb-22 md:mb-22 pt-35 md:pt-0"}>
        <div className={"max-w-md mb-24 px-8 lg:px-0"}>
          <Typography variant={"display3"} className={"text-balance"}>
            Hai bisogno di aiuto? Parti da qui.
          </Typography>
          <p className={"text-base text-secondary mt-6"}>
            Scopri come esplorare gli spazi, salvare le tue opere preferite e acquistare con artpay in modo semplice e
            sicuro.
          </p>
        </div>
        <div className={"px-8 lg:px-0 space-y-24"}>
          <div className={"slider"}>
            <Typography variant={"h3"} className={"text-balance mb-6!"}>
              Scopri artpay
            </Typography>
            <div
              className={
                "slider-container w-full bg-[#010F22] pt-14 px-6 md:px-24 rounded-[8px] overflow-hidden pb-12 relative"
              }>

              <div className="absolute top-2/5 md:top-1/2 left-4 transform -translate-y-1/2 z-10">
                <IconButton
                  onClick={prevSlide}
                  className="bg-primary! hover:bg-primary/80! text-white! size-12! disabled:opacity-60"
                  disabled={currentSlide === 0}>
                  <ArrowBack />
                </IconButton>
              </div>
              <div className="absolute top-2/5 md:top-1/2 right-4 transform -translate-y-1/2 z-10">
                <IconButton
                  onClick={nextSlide}
                  className="bg-primary! hover:bg-primary/80! text-white! size-12! disabled:opacity-60"
                  disabled={currentSlide === tutorialSlides.length - 1}>
                  <ArrowForward />
                </IconButton>
              </div>

              <div className={"slider-wrapper overflow-hidden"}>
                <div
                  className={"slider-track flex transition-transform duration-300 ease-in-out"}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {tutorialSlides.map((slide) => (
                    <div key={slide.id} className={"slider-item flex flex-col min-w-full"}>
                      <img src={slide.image} alt={slide.imageAlt} className={"w-full h-auto object-cover"} loading={'eager'}/>
                      <div className={"mt-12 md:mt-7 max-w-2xl"}>
                        <Typography variant={"h4"} color={"white"}>
                          {slide.title}
                        </Typography>
                        <p className={"text-white mt-4 text-base leading-relaxed"}>{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-8 space-x-2">
                {tutorialSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index === currentSlide ? "bg-primary" : "bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="mt-4 bg-white/20 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentSlide + 1) / tutorialSlides.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-6 text-white/70 text-sm">
                <span>
                  {currentSlide + 1} di {tutorialSlides.length}
                </span>
                <button
                  onClick={nextSlide}
                  className="text-primary underline underline-offset-2 hover:no-underline transition-all duration-200 cursor-pointer"
                  disabled={currentSlide === tutorialSlides.length - 1}>
                  {currentSlide === tutorialSlides.length - 1 ? "Fine" : "Avanti"}
                </button>
              </div>
            </div>
          </div>
          <div className={"tutorials-wrapper"}>
            <Typography variant={"h3"} className={"text-balance mb-6!"}>
              Tutte le guide artpay
            </Typography>
            <PostGrid />
          </div>
          <div>
            <NewsletterBig title="Accedi in anteprima a opere, artisti e storie selezionate." />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Tutorials;
