import { Asset } from 'contentful';

export interface LandingCampaignFeature {
  title: string;
  description: string;
}

export interface LandingCampaignHero {
  tagline: string;
  taglineColor?: string;
  subtitle: string;
  subtitleColor?: string;
  heading: string;
  description: string;
}

export interface LandingCampaignContent {
  slug: string;
  campaignName: string;
  partnerName?: string;
  partnerLogo?: Asset;
  partnerDescription?: string;
  hero: LandingCampaignHero;
  featuresTitle?: string;
  featuresTitleColor?: string;
  features: LandingCampaignFeature[];
  formHtml?: string;
}