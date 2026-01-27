import { useEffect, useState } from "react";
import LandingLayout from "./components/layouts/LandingLayout.tsx";
import BrevoForm from "./components/brevoform/BrevoForm.tsx";
import LandingCampaignCopy from "./components/landingcampaign/LandingCampaignCopy.tsx";
import HotjarTracking from "../../components/HotjarTracking.tsx";
import Logo from "../../components/icons/Logo.tsx";
import { getLandingCampaign } from "../../services/contentful.ts";
import { LandingCampaignContent } from "../../types/contentful-landing-campaign.ts";
import { useParams } from "react-router-dom";

const LandingForCampaign = () => {
  const { slug } = useParams();
  const [campaignData, setCampaignData] = useState<LandingCampaignContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        if (slug) {
          const data = await getLandingCampaign(slug);
          setCampaignData(data);
        }
      } catch (error) {
        console.error('Error loading campaign data:', error);
      } finally {
        setIsLoading(false);
      }
    };
     fetchCampaignData()
  }, [slug]);

  if (isLoading) {
    return (
      <LandingLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl">Caricamento...</p>
        </div>
      </LandingLayout>
    );
  }

  if (!campaignData) {
    return (
      <LandingLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-xl">Contenuto non disponibile</p>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <HotjarTracking />
      <aside>
        <div className="max-w-xl mb-12">
          {campaignData.partnerName && campaignData.partnerLogo && (
            <div className={"flex gap-2 items-center mb-6 justify-center md:-translate-x-1/12"}>
              <Logo className={"h-20"}/> {"x"}

              <div
                className={"w-20 h-10 top-2 relative bg-no-repeat bg-contain bg-center"}
                style={{
                  backgroundImage: `url(https:${campaignData?.partnerLogo?.fields?.file?.url})`
                }}
                role="img"
                aria-label={`Logo ${campaignData.partnerName}`}
              />
            </div>
          )}
          {campaignData.partnerDescription && (
            <p className={"text-2xl leading-[125%] text-balance"}>
              {campaignData.partnerDescription}
            </p>
          )}
        </div>
        <LandingCampaignCopy
          hero={campaignData.hero}
          features={campaignData.features}
          featuresTitle={campaignData.featuresTitle}
          featuresTitleColor={campaignData.featuresTitleColor}
        />
      </aside>
      <aside className={"relative min-h-screen"}>
        <BrevoForm />
      </aside>
    </LandingLayout>
  );
};

export default LandingForCampaign;