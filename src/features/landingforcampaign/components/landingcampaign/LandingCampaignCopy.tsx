import Anchor from "../anchor/Anchor.tsx";
import { LandingCampaignFeature, LandingCampaignHero } from "../../../../types/contentful-landing-campaign.ts";

interface LandingCampaignCopyProps {
  hero: LandingCampaignHero;
  features: LandingCampaignFeature[];
  featuresTitle?: string;
  featuresTitleColor?: string;
}

const LandingCampaignCopy = ({ hero, features, featuresTitle, featuresTitleColor }: LandingCampaignCopyProps) => {
  return (
    <section className={'max-w-xl'}>
      <section className={"leading-[105%] space-y-4 mb-12"}>
        <div>
          <span
            className={`uppercase text-lg font-bold`}
            style={{ color: hero.taglineColor || '#6576EE' }}>
            {hero.tagline}
          </span>
          <h1
            className={`text-lg uppercase`}
            style={{ color: hero.subtitleColor || '#808791' }}>
            {hero.subtitle}
          </h1>
        </div>
        <h2 className={"font-bold text-4xl text-balance"}>{hero.heading}</h2>
        <p className={"text-2xl"}>
          {hero.description}
        </p>
      </section>
      <Anchor />
      <section className={'lg:mb-12'}>
        <h3
          className={"text-2xl font-medium mb-12"}
          style={{ color: featuresTitleColor || '#808791' }}>
          {featuresTitle || 'Perché scegliere artpay?'}
        </h3>
        <ul className={"ps-4 text-lg space-y-4"}>
          {features.map((feature, index) => (
            <li
              key={index}
              className={
                'before:text-[#6576EE] before:content-["•"] relative before:absolute before:-top-2 before:-left-4 before:text-2xl ps-4 leading-[115%]'
              }>
              <strong>{feature.title}</strong>
              <p>{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>
      <Anchor />
    </section>
  );
};

export default LandingCampaignCopy;