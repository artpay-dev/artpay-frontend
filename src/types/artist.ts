type ArtistArtwork = {
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
  meta: [];
  artworks?: ArtistArtwork[];
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
