import { CardSize, MetadataItem } from "./types";
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

export const userToUserInfo = (user: User): UserInfo => {
  return {
    email: user.email,
    id: user.id,
    username: user.name,
  };
};

export const artworkToGalleryItem = (
  artwork: Artwork,
  cardSize?: CardSize,
  valueMatcher?: categoryValueMatcher,
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
    year: getPropertyFromMetadata(artwork?.meta_data || [], "anno_di_produzione")?.value,
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
  };
};
export const artistToGalleryItem = (artist: Artist): ArtistCardProps => {
  const imgUrl = artist?.medium_img?.length
    ? artist?.medium_img[0]
    : artist.artworks?.length && artist.artworks[0].images?.length
      ? artist.artworks[0].images[0]
      : "";
  return {
    id: artist.id.toString(),
    slug: artist.slug,
    isFavourite: false,
    subtitle: `${artist.acf.location}, ${artist.acf.birth_year}`,
    title: artist.title?.rendered || "",
    description: artist.excerpt?.rendered || "",
    artworksCount: artist.artworks?.length || 0,
    imgUrl: imgUrl,
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
  foundationYear: gallery.shop?.foundation_year,
});
export const galleryToGalleryItem = (gallery: Gallery): GalleryCardProps => ({
  id: gallery.id,
  title: gallery.display_name,
  slug: gallery.nice_name,
  subtitle: `${gallery.address?.city}`,
  imgUrl: gallery.shop.banner,
});

export const orderToOrderHistoryCardProps = (order: Order): OrderHistoryCardProps => {
  const lineItem = order.line_items.length ? order.line_items[0] : undefined;
  const galleryName = lineItem?.meta_data.find((m) => m.key?.toLowerCase() === "sold by")?.display_value;
  let datePaid = "";
  if (order.date_paid) {
    try {
      datePaid = new Date(order.date_paid).toLocaleDateString();
    } catch (e) {
      console.warn(e);
    }
  }
  return {
    formattePrice: `€ ${order.total}`,
    galleryName: galleryName || "",
    purchaseDate: datePaid,
    purchaseMode: order.payment_method || "",
    subtitle: "",
    title: lineItem?.name || "Opera senza titolo",
    imgSrc: lineItem?.image?.src || "",
  };
};

export const artworkToOrderItems = (artworks: Artwork[], valueMatcher: categoryValueMatcher): OrderLoanCardProps[] => {
  return artworks.map((a) => artworkToOrderItem(a, valueMatcher));
};
export const artworksToGalleryItems = (
  artworks: Artwork[],
  cardSize?: CardSize,
  valueMatcher?: categoryValueMatcher,
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
    order: +(post.acf.ordine || "0"),
  };
};

interface SortablePromoItem extends PromoItemProps {
  order: number;
}

export const postAndMediaToPromoItem = (
  componentType: PromoComponentType,
  post: Post,
  media?: Media,
): SortablePromoItem => {
  return {
    cta: post.excerpt?.rendered ? ctaFromLink(post.excerpt?.rendered) : undefined,
    imgUrl: media?.source_url || "",
    content: post.content?.rendered || "",
    title: post.title?.rendered || "",
    order: +(post.acf.ordine || "0"),
    componentType: componentType,
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
    "phone",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      return false;
    }
  }

  return true;
};

export const processBillingData = ({ same_as_shipping, ...billingData }: UnprocessedBillingData): BillingData => {
  const processedBillingData: BillingData = {...billingData}
  processedBillingData.same_as_shipping = Boolean(same_as_shipping)
  return processedBillingData
}
export const processUserProfile = ({ billing, ...userProfile }: UnprocessedUserProfile): UserProfile => {
  return { ...userProfile, billing: processBillingData(billing) }
}


export const isTimestampAfter = (timestampInSeconds: number, durationInSeconds: number) => {
  // Get current timestamp in seconds
  const nowInSeconds = Math.floor(Date.now() / 1000);

  // Calculate the timestamp for one hour ago
  const oneHourAgoInSeconds = nowInSeconds - durationInSeconds;

  // Check if the given timestamp is in the last hour
  return timestampInSeconds > oneHourAgoInSeconds;
};
