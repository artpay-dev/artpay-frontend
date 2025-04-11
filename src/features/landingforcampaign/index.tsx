import LandingLayout from "./components/layouts/LandingLayout.tsx";
import BrevoForm from "./components/brevoform/BrevoForm.tsx";
import LandingCampaignCopy from "./components/landingcampaign/LandingCampaignCopy.tsx";
import HotjarTracking from "../../components/HotjarTracking.tsx";

const LandingForCampaign = () => {
  return (
    <LandingLayout>
      <HotjarTracking />
      <aside >
        <LandingCampaignCopy />
      </aside>
      <aside className={'relative min-h-screen'}>
        <BrevoForm />
      </aside>
    </LandingLayout>
  );
};

export default LandingForCampaign;