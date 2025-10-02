import LandingLayout from "./components/layouts/LandingLayout.tsx";
import BrevoForm from "./components/brevoform/BrevoForm.tsx";
import LandingCampaignCopy from "./components/landingcampaign/LandingCampaignCopy.tsx";
import HotjarTracking from "../../components/HotjarTracking.tsx";
import Logo from "../../components/icons/Logo.tsx";

const LandingForCampaign = () => {
  return (
    <LandingLayout>
      <HotjarTracking />
      <aside>
        <div className="max-w-xl mb-12">
          <div className={"flex gap-2 items-center mb-6 justify-center md:-translate-x-1/12"}>
            <Logo className={"h-20"}/> {"x"}

            <div
              className={"w-20 h-10 top-2 relative bg-no-repeat bg-contain bg-center"}
              style={{ backgroundImage: "url('/images/logo-TheOthers_Y.png')" }}
              role="img"
              aria-label="Logo the others logo"
            />
          </div>
          <p className={"text-2xl leading-[125%] text-balance"}>
            The Others 2025 - XIV edizione sceglie artpay per promuovere l’utilizzo di soluzioni di pagamento digitali, flessibili e innovative al servizio di gallerie, artisti e collezionisti
          </p>
        </div>
        <LandingCampaignCopy />
      </aside>
      <aside className={"relative min-h-screen"}>
        <BrevoForm />
      </aside>
    </LandingLayout>
  );
};

export default LandingForCampaign;