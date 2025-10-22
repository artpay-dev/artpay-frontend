import { createClient } from 'contentful';

const contentfulClient = createClient({
  space: import.meta.env.VITE_CONTENTFUL_STAGING_SPACE_ID!,
  accessToken: import.meta.env.VITE_CONTENTFUL_STAGING_ACCESS_TOKEN!,
  environment: 'staging',
});

export default contentfulClient;
