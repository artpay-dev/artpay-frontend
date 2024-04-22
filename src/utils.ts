import { CardSize, MetadataItem, OrderMetadataItem } from "./types";
import { Artwork } from "./types/artwork.ts";
import { ArtworkCardProps } from "./components/ArtworkCard.tsx";
import { ArtistCardProps } from "./components/ArtistCard.tsx";
import { Artist } from "./types/artist.ts";
import { Gallery, GalleryContent } from "./types/gallery.ts";
import { Post } from "./types/post.ts";
import { Media } from "./types/media.ts";
import { HeroSlideItem } from "./components/HeroSlide.tsx";
import { Cta } from "./types/ui.ts";
import { PromoComponentType, PromoItemProps } from "./components/PromoItem.tsx";
import {
  BaseUserData,
  BillingData,
  UnprocessedBillingData,
  UnprocessedUserProfile,
  User,
  UserInfo,
  UserProfile
} from "./types/user.ts";
import { GalleryCardProps } from "./components/GalleryCard.tsx";
import { Order } from "./types/order.ts";
import { OrderHistoryCardProps } from "./components/OrderHistoryCard.tsx";
import { OrderLoanCardProps } from "./components/OrderLoanCard.tsx";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import localeIt from "dayjs/locale/it";

dayjs.extend(localizedFormat);
dayjs.locale(localeIt, {}, false);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(weekday);
dayjs.extend(localeData);

console.log("localeIt", localeIt);

interface categoryValueMatcher {
  getCategoryMapValues(artwork: Artwork, key: string): string[];
}

export const getPropertyFromMetadata = (metadata: MetadataItem[], key: string): { [key: string]: string } => {
  const item = metadata.find((p) => p.key === key);
  if (!item) {
    return {};
  }
  return typeof item.value === "object" ? item.value : { value: item.value };
};

export const getPropertyFromOrderMetadata = (metadata: OrderMetadataItem[], key: string): string | undefined => {
  const item = metadata.find((p) => p.key === key);
  if (!item) {
    return undefined;
  }
  return item.value;
};

export const userToUserInfo = (user: User): UserInfo => {
  console.log("userToUserInfo", user.name);
  return {
    email: user.email,
    id: user.id,
    username: user.name
  };
};

export const artworkToGalleryItem = (
  artwork: Artwork,
  cardSize?: CardSize,
  valueMatcher?: categoryValueMatcher
): ArtworkCardProps => {
  return {
    id: artwork.id.toString(),
    artistName: getPropertyFromMetadata(artwork.meta_data, "artist")?.artist_name,
    galleryId: artwork.vendor,
    galleryName: artwork.store_name,
    price: +artwork.price,
    size: cardSize,
    title: artwork.name,
    slug: artwork.slug,
    imgUrl: artwork?.images?.length ? artwork.images[0].src : "",
    estimatedShippingCost: artwork?.acf?.estimated_shipping_cost,
    dimensions: getArtworkDimensions(artwork),
    technique: valueMatcher?.getCategoryMapValues(artwork, "tecnica").join(" ") || "",
    year: getPropertyFromMetadata(artwork?.meta_data || [], "anno_di_produzione")?.value
  };
};
export const artworkToOrderItem = (artwork: Artwork, valueMatcher?: categoryValueMatcher): OrderLoanCardProps => {
  return {
    id: artwork.id.toString(),
    artistName: getPropertyFromMetadata(artwork.meta_data, "artist")?.artist_name,
    galleryId: artwork.vendor,
    galleryName: artwork.store_name,
    price: +artwork.price,
    title: artwork.name,
    slug: artwork.slug,
    imgUrl: artwork?.images?.length ? artwork.images[0].src : "",
    artworkSize: getArtworkDimensions(artwork),
    artworkTechnique: valueMatcher?.getCategoryMapValues(artwork, "tecnica").join(" ") || "",
    reservedUntil: parseDate(artwork?.acf?.customer_reserved_until)
  };
};
export const artistToGalleryItem = (artist: Artist, size: CardSize = "medium"): ArtistCardProps => {
  const imgUrl = artist?.medium_img?.length
    ? artist?.medium_img[0]
    : artist.artworks?.length && artist.artworks[0].images?.length
      ? artist.artworks[0].images[0]
      : "";
  return {
    size: size,
    id: artist.id.toString(),
    slug: artist.slug,
    isFavourite: false,
    subtitle: `${artist.acf?.location}, ${artist.acf?.birth_year}`,
    title: artist.title?.rendered || "",
    description: artist.excerpt?.rendered || "",
    artworksCount: artist.artworks?.length || 0,
    imgUrl: imgUrl
  };
};

export const galleryToGalleryContent = (gallery: Gallery): GalleryContent => ({
  id: gallery.id,
  title: gallery.display_name,
  subtitle: `${gallery.address?.city}`,
  logoImage: gallery.shop?.image,
  coverImage: gallery.shop?.banner,
  categories: [],
  description: gallery.message_to_buyers,
  productsCount: gallery.products_count,
  foundationYear: gallery.shop?.foundation_year
});
export const galleryToGalleryItem = (gallery: Gallery): GalleryCardProps => ({
  id: gallery.id,
  title: gallery.display_name,
  slug: gallery.nice_name,
  subtitle: `${gallery.address?.city}`,
  imgUrl: gallery.shop.banner
});

export const orderToOrderHistoryCardProps = (order: Order): OrderHistoryCardProps => {
  const lineItem = order.line_items.length ? order.line_items[0] : undefined;
  const galleryName = lineItem?.meta_data.find((m) => m.key?.toLowerCase() === "sold by" || m.key?.toLowerCase() === "venduto da")?.display_value;
  let datePaid = "";
  if (order.date_paid) {
    try {
      datePaid = new Date(order.date_paid).toLocaleDateString();
    } catch (e) {
      console.warn(e);
    }
  }
  // o.purchaseMode === "Stripe SEPA"
  return {
    id: order.id,
    formattePrice: `€ ${order.total}`,
    galleryName: galleryName || "",
    purchaseDate: datePaid,
    purchaseMode: order.payment_method || "",
    waitingPayment: order.status === "on-hold" && order.payment_method === "Stripe SEPA",
    subtitle: "",
    title: lineItem?.name || "Opera senza titolo",
    status: order.status,
    imgSrc: lineItem?.image?.src || ""
  };
};

export const artworkToOrderItems = (artworks: Artwork[], valueMatcher: categoryValueMatcher): OrderLoanCardProps[] => {
  return artworks.map((a) => artworkToOrderItem(a, valueMatcher));
};
export const artworksToGalleryItems = (
  artworks: Artwork[],
  cardSize?: CardSize,
  valueMatcher?: categoryValueMatcher
): ArtworkCardProps[] => {
  return artworks.map((a) => artworkToGalleryItem(a, cardSize, valueMatcher));
};

export const artistsToGalleryItems = (artists: Artist[]): ArtistCardProps[] => {
  return artists.map((a) => artistToGalleryItem(a));
};
export const galleriesToGalleryItems = (galleries: Gallery[]): GalleryCardProps[] => {
  return galleries.map((a) => galleryToGalleryItem(a));
};
export const ordersToOrderHistoryCardProps = (orders: Order[]): OrderHistoryCardProps[] => {
  return orders.map((a) => orderToOrderHistoryCardProps(a));
};

export const getArtworkDimensions = (artwork?: Artwork): string => {
  if (!artwork) {
    return "";
  }
  return `${artwork?.dimensions.width || 0} x ${artwork?.dimensions.height || 0} x ${
    artwork?.dimensions.length || 0
  } cm`;
};

function ctaFromLink(htmlString: string): Cta | undefined {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const linkElement = doc.querySelector("a");

  if (linkElement) {
    const href = linkElement.getAttribute("href") || "";
    const text = linkElement.textContent || "";
    return { link: href, text };
  } else {
    return undefined;
  }
}

interface SortableHeroSlideItem extends HeroSlideItem {
  order: number;
}

export const postAndMediaToHeroSlide = (post: Post, media?: Media): SortableHeroSlideItem => {
  return {
    cta: post.excerpt?.rendered ? ctaFromLink(post.excerpt?.rendered) : undefined,
    imgUrl: media?.source_url || "",
    subtitle: post.content?.rendered || "",
    title: post.title?.rendered || "",
    order: +(post.acf.ordine || "0")
  };
};

interface SortablePromoItem extends PromoItemProps {
  order: number;
}

export const postAndMediaToPromoItem = (
  componentType: PromoComponentType,
  post: Post,
  media?: Media
): SortablePromoItem => {
  return {
    cta: post.excerpt?.rendered ? ctaFromLink(post.excerpt?.rendered) : undefined,
    imgUrl: media?.source_url || "",
    content: post.content?.rendered || "",
    title: post.title?.rendered || "",
    order: +(post.acf.ordine || "0"),
    componentType: componentType
  };
};

export const areBillingFieldsFilled = (data?: BaseUserData): boolean => {
  if (!data) {
    return false;
  }
  const requiredFields: (keyof BaseUserData)[] = [
    "first_name",
    "last_name",
    "address_1",
    "city",
    "postcode",
    "country",
    "state",
    "phone"
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      return false;
    }
  }

  return true;
};

export const processBillingData = ({ same_as_shipping, ...billingData }: UnprocessedBillingData): BillingData => {
  const processedBillingData: BillingData = { ...billingData };
  processedBillingData.same_as_shipping = Boolean(same_as_shipping);
  return processedBillingData;
};
export const processUserProfile = ({ billing, ...userProfile }: UnprocessedUserProfile): UserProfile => {
  return { ...userProfile, billing: processBillingData(billing) };
};

export const newOrder = (artwork: Artwork) => {
  const now = new Date().toJSON();
  const tax = ((+artwork.price) * 0.22).toFixed(2);
  const image = artwork?.images?.length ? artwork.images[0] : undefined;
  const order: Order = {
    id: 0,
    parent_id: 0,
    status: "pending",
    currency: "EUR",
    version: "",
    prices_include_tax: true,
    date_created: now,
    date_modified: now,
    discount_total: "0.00",
    discount_tax: "0.00",
    shipping_total: "0.00",
    shipping_tax: "0.00",
    cart_tax: ((+artwork.price) * 0.22).toFixed(2),
    total: artwork.price,
    total_tax: ((+artwork.price) * 0.22).toFixed(2),
    customer_id: 0,
    order_key: "",
    billing: {
      first_name: "",
      last_name: "",
      company: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
      email: "",
      phone: ""
    },
    shipping: {
      first_name: "",
      last_name: "",
      company: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
      phone: ""
    },
    payment_method: "",
    payment_method_title: "",
    transaction_id: "",
    customer_ip_address: "",
    customer_user_agent: "",
    created_via: "rest-api",
    customer_note: "",
    date_completed: null,
    date_paid: null,
    cart_hash: "",
    number: "",
    meta_data: [],
    line_items: [
      {
        id: 0,
        name: artwork.name,
        product_id: artwork.id,
        variation_id: 0,
        quantity: 1,
        tax_class: "",
        subtotal: artwork.price,
        subtotal_tax: tax,
        total: artwork.price,
        total_tax: tax,
        taxes: [
          {
            id: 1,
            total: tax,
            subtotal: tax
          }
        ],
        meta_data: [
          {
            id: 19859,
            key: "_vendor_id",
            value: artwork.vendor,
            display_key: "_vendor_id",
            display_value: artwork.vendor
          },
          {
            id: 19860,
            key: "Venduto da",
            value: "Art Luxury Gallery",
            display_key: "Venduto da",
            display_value: "Art Luxury Gallery"
          }
        ],
        sku: "",
        price: +artwork.price,
        image: {
          id: image?.id?.toString() || "",
          src: image?.src || ""
        },
        parent_name: null
      }
    ],
    tax_lines: [
      {
        id: 1669,
        rate_code: "IT-IVA 22%-1",
        rate_id: 1,
        label: "IVA 22%",
        compound: false,
        tax_total: tax,
        shipping_tax_total: "0.00",
        rate_percent: 22,
        meta_data: []
      }
    ],
    shipping_lines: [],
    fee_lines: [],
    coupon_lines: [],
    refunds: [],
    payment_url: "",
    is_editable: true,
    needs_payment: true,
    needs_processing: true,
    date_created_gmt: now,
    date_modified_gmt: now,
    date_completed_gmt: null,
    date_paid_gmt: null,
    currency_symbol: "€"
  };

  return order;
};

export const isTimestampAfter = (timestampInSeconds: number, durationInSeconds: number) => {
  // Get current timestamp in seconds
  const nowInSeconds = Math.floor(Date.now() / 1000);

  // Calculate the timestamp for one hour ago
  const oneHourAgoInSeconds = nowInSeconds - durationInSeconds;

  // Check if the given timestamp is in the last hour
  return timestampInSeconds > oneHourAgoInSeconds;
};

export const formatCurrency = (value: number) => value.toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const getDefaultPaddingX = () => ({ xs: 3, sm: 4, md: 8, lg: 12 });

export const parseDate = (dt?: string) => {
  if (!dt) {
    return "";
  }
  try {
    return dayjs(dt).format("DD MMMM YYYY");
  } catch (e) {
    console.warn("Date parse error: ", e);
    return "";
  }
};
export const formatMessageDate = (dt?: string | Date) => {
  if (!dt) {
    return "";
  }
  try {
    const parsedDate = dayjs(dt);
    if (parsedDate.isToday()) {
      return parsedDate.format("hh:mm");
    } else if (parsedDate.isYesterday()) {
      return "Ieri";
    } else if (dayjs(new Date()).diff(parsedDate, "days") < 7) {
      return dayjs.weekdays(true)[parsedDate.weekday()];
    }
    return dayjs(dt).format("DD/MM/YYYY");
  } catch (e) {
    console.error("Date parse error: ", e);
    return "";
  }
};

// Ricarica pagina intenzionale e richiesta dal cliente, questa funzione sostituisce
// import { useNavigate } from "react-router-dom";
export const useNavigate = () => {
  return (to: string) => {
    window.location.href = to;
  };
};