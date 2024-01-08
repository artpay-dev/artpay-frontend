export type Gallery = {
  id: number;
  name: string;
  avatar_id: string;
  products_count: number;
  orders_count: number;
  followers_count: number;
  login: string;
  first_name: string;
  last_name: string;
  nice_name: string;
  display_name: string;
  email: string;
  url: string;
  registered: string;
  status: string;
  roles: string[];
  allcaps: {
    [key: string]: boolean;
  };
  timezone_string: string;
  gmt_offset: string;
  shop: {
    url: string;
    title: string;
    slug: string;
    description: string;
    image: string;
    banner: string;
  };
  address: {
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
    phone: string;
  };
  social: {
    facebook: string;
    twitter: string;
    google_plus: string;
    linkdin: string;
    youtube: string;
    instagram: string;
  };
  payment: {
    payment_mode: string;
    bank_account_type: string;
    bank_name: string;
    bank_account_number: string;
    bank_address: string;
    account_holder_name: string;
    aba_routing_number: string;
    destination_currency: string;
    iban: string;
    paypal_email: string;
  };
  message_to_buyers: string;
  rating_count: number;
  avg_rating: string;
  _links: {
    self: {
      href: string;
    }[];
    collection: {
      href: string;
    }[];
  };
};

export interface GalleryContent {
  coverImage: string;
  title: string;
  logoImage: string;
  subtitle: string;
  description: string;
  categories: string[];
  productsCount?: number;
}
