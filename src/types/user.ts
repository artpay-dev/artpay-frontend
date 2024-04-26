import { Dayjs } from "dayjs";

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
    persisted_preferences: unknown[];
  };
  wc_api_user_keys: {
    consumer_key: string;
    consumer_secret: string;
  };
  acf: {
    same_shipping_billing_address?: boolean | null;
  };
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

export interface BaseUserData {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  postcode: string;
  country: string;
  state: string;
  phone: string;
  email?: string;
}

export interface ShippingData extends BaseUserData {

}

export interface BillingData extends BaseUserData {
  cf?: string;
  invoice_type?: string;
  PEC?: string;
  private_customer?: string;
  same_as_shipping?: boolean;
}

export type UnprocessedBillingData = Exclude<BillingData, "same_as_shipping"> & { same_as_shipping?: string }


export interface UserProfile {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: BillingData;
  shipping: ShippingData;
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data?: { key: string, value: string }[];
  _links: {
    self: {
      href: string;
    }[];
    collection: {
      href: string;
    }[];
  };
}

export interface UnprocessedUserProfile extends UserProfile {
  billing: UnprocessedBillingData;
}

export interface UpdateUserProfile {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  billing?: Partial<BillingData>;
  shipping?: Partial<ShippingData>;
  is_paying_customer?: boolean;
  avatar_url?: string;
  meta_data?: { key: string, value: string }[];
}

export type GoogleUserInfo = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
};

export type CustomerQuestion = {
  product_id: number;
  question: string
}
export type CustomerQuestionResponse = {
  message: string
}

export type VendorAnswer = {
  ans_ID: string;
  ques_ID: string;
  ans_details: string;
  ans_by: string;
  ans_created: string;
  ans_vote: string;
}

export type QuestionWithAnswer = {
  ques_ID: string;
  product_ID: string;
  ques_details: string;
  ques_by: string;
  ques_created: string;
  ques_vote: string;
  status: "verified" | string;
  answer?: VendorAnswer;
}

export type Message = {
  userMessage: boolean;
  text: string;
  date: Dayjs;
}