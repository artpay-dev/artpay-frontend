export type ArtistArtwork = {
  ID: string;
  artwork_name: string;
  price: string;
  images: [string, number, number, boolean];
};

export type Artist = {
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
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  template: string;
  categoria_artisti: number[];
  meta: [];
  artworks?: ArtistArtwork[];
  featured_img?: [string, number, number, boolean];
  full_img?: [string, number, number, boolean];
  medium_img?: [string, number, number, boolean];
  thumb_img?: [string, number, number, boolean];
  acf: {
    birth_nation: string;
    birth_year: string;
    location: string;
  };
  _links: {
    self: {
      href: string;
    }[];
    collection: {
      href: string;
    }[];
    about: {
      href: string;
    }[];
    author: {
      embeddable: boolean;
      href: string;
    }[];
    "wp:attachment": {
      href: string;
    }[];
    curies: {
      name: string;
      href: string;
      templated: boolean;
    }[];
  };
};

export type ArtistPost = {
  ID: string;
  post_author: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
  post_excerpt: string;
  post_status: string;
  comment_status: string;
  ping_status: string;
  post_password: string;
  post_name: string;
  to_ping: string;
  pinged: string;
  post_modified: string;
  post_modified_gmt: string;
  post_content_filtered: string;
  post_parent: string;
  guid: string;
  menu_order: string;
  post_type: string;
  post_mime_type: string;
  comment_count: string;
};
