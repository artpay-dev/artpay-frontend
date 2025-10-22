import contentfulClient from "../lib/contentful/contentful.ts";

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

