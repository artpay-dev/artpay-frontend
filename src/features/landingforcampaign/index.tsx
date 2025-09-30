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
          <div className={"flex gap-2 items-center mb-6"}>
            <Logo className={"w-20"}/> {"x"}
            <img src="/images/logo-TheOthers_W-300x134.png" alt="Logo the others logo" className={"w-24 top-2 relative invert"} />
          </div>
          <p className={"text-lg leading-[125%] text-balance"}>
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