export type PostCategoryMap = {
  [slug: string]: PostCategory;
};

export type FavouritesMap = {
  galleries: number[] | null;
  artists: number[] | null;
  artworks: number[] | null;
};

export type PostCategory = {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: unknown[];
  acf: unknown[];
};

export type Post = {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title?: {
    rendered: string;
  };
  content?: {
    rendered: string;
    protected: boolean;
  };
  excerpt?: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: {
    footnotes: string;
  };
  categories: number[];
  tags: unknown[];
  acf: {
    ordine?: string;
  };
  _links: {
    self: { href: string }[];
    collection: { href: string }[];
    about: { href: string }[];
    author: { embeddable: boolean; href: string }[];
    replies: { embeddable: boolean; href: string }[];
    version_history: { count: number; href: string }[];
    predecessor_version: { id: number; href: string }[];
    "wp:attachment": { href: string }[];
    "wp:term": {
      taxonomy: string;
      embeddable: boolean;
      href: string;
    }[];
    curies: {
      name: string;
      href: string;
      templated: boolean;
    }[];
  };
};
