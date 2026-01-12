import contentfulClient from "../lib/contentful/contentful.ts";
import { LandingCampaignContent } from "../types/contentful-landing-campaign.ts";

export async function getEntriesByType(contentType: string) {
  const response = await contentfulClient.getEntries({ content_type: contentType });

  return response.items.map(item => item.fields);
}


export async function getPostBySlug(contentType: string, slug: string) {
  const res = await contentfulClient.getEntries({
    content_type: contentType,
    'fields.slug': slug,
    include: 2,
    limit: 1,
  });

  if (res.items.length > 0) {
    return res.items[0].fields;
  }

  return null;
}

export async function getLandingCampaign(slug: string): Promise<LandingCampaignContent | null> {
  try {
    const res = await contentfulClient.getEntries({
      content_type: 'landingCampaign',
      'fields.slug': slug,
      include: 2,
      limit: 1,
    });

    if (res.items.length > 0) {
      const campaignData = res.items[0].fields;

      // Estrai l'HTML dal Rich Text se presente
      if (campaignData.formHtml && typeof campaignData.formHtml === 'object') {
        const richText = campaignData.formHtml as any;
        if (richText.nodeType === 'document' && richText.content?.[0]?.content?.[0]?.value) {
          campaignData.formHtml = richText.content[0].content[0].value;
        }
      }

      console.log('Contentful Campaign Data:', campaignData);
      console.log('formHtml:', campaignData.formHtml);
      return campaignData as unknown as LandingCampaignContent;
    }

    return null;
  } catch (error) {
    console.error('Error fetching landing campaign from Contentful:', error);
    return null;
  }
}

