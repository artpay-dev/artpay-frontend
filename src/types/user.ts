export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

export type User = {
  id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  url: string;
  description: string;
  link: string;
  locale: string;
  nickname: string;
  slug: string;
  roles: string[];
  registered_date: string;
  capabilities: {
    [key: string]: boolean;
    edit_shop_order: boolean;
    edit_shop_orders: boolean;
    edit_users: boolean;
    list_roles: boolean;
    list_users: boolean;
    publish_shop_orders: boolean;
    read: boolean;
    read_private_products: boolean;
    read_private_shop_coupons: boolean;
    read_product: boolean;
    read_shop_coupon: boolean;
    read_shop_order: boolean;
    customer: boolean;
  };
  extra_capabilities: {
    customer: boolean;
  };
  avatar_urls: {
    "24": string;
    "48": string;
    "96": string;
  };
  meta: {
    persisted_preferences: unknown[]; // You might want to replace 'any' with a more specific type
  };
  wc_api_user_keys: {
    consumer_key: string;
    consumer_secret: string;
  };
  acf: unknown[]; // You might want to replace 'any' with a more specific type
  is_super_admin: boolean;
  woocommerce_meta: {
    [key: string]: string;
    // Add more specific types if known
  };
  _links: {
    self: {
      href: string;
    }[];
    collection: {
      href: string;
    }[];
  };
};
