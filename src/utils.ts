import { CardSize, MetadataItem } from "./types";
import { Artwork } from "./types/artwork.ts";
import { ArtworkCardProps } from "./components/ArtworkCard.tsx";
import { ArtistCardProps } from "./components/ArtistCard.tsx";
import { Artist, ArtistPost } from "./types/artist.ts";
import { Gallery, GalleryContent } from "./types/gallery.ts";
import { Post } from "./types/post.ts";
import { Media } from "./types/media.ts";
import { HeroSlideItem } from "./components/HeroSlide.tsx";
import { Cta } from "./types/ui.ts";
import { PromoComponentType, PromoItemProps } from "./components/PromoItem.tsx";
import { BillingData, User, UserInfo } from "./types/user.ts";
import { GalleryCardProps } from "./components/GalleryCard.tsx";
import { Order } from "./types/order.ts";
import { OrderHistoryCardProps } from "./components/OrderHistoryCard.tsx";
import { OrderLoanCardProps } from "./components/OrderLoanCard.tsx";

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

export const artworkToGalleryItem = (artwork: Artwork, cardSize?: CardSize): ArtworkCardProps => {
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
  };
};
export const artworkToOrderLoanItem = (artwork: Artwork): OrderLoanCardProps => {
  return {
    id: artwork.id.toString(),
    artistName: getPropertyFromMetadata(artwork.meta_data, "artist")?.artist_name,
    galleryId: artwork.vendor,
    galleryName: artwork.store_name,
    price: +artwork.price,
    title: artwork.name,
    slug: artwork.slug,
    imgUrl: artwork?.images?.length ? artwork.images[0].src : "",
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
    isFavourite: false,
    subtitle: `${artist.acf.location}, ${artist.acf.birth_year}`,
    title: artist.title?.rendered || "",
    description: artist.excerpt?.rendered || "",
    artworksCount: artist.artworks?.length || 0,
    imgUrl: imgUrl,
  };
};
export const artistPostToGalleryItem = (artist: ArtistPost): ArtistCardProps => {
  return {
    id: artist.ID.toString(),
    isFavourite: false,
    subtitle: "", //manca: luogo e anno di nascita `${artist.acf.location}, ${artist.acf.birth_year}`,
    title: artist.post_title || "",
    description: artist.post_excerpt || "",
    artworksCount: 0, //manca: conteggio opere,
    imgUrl: "", //manca: url immagine artista
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

export const artworksToGalleryItems = (artworks: Artwork[], cardSize?: CardSize): ArtworkCardProps[] => {
  return artworks.map((a) => artworkToGalleryItem(a, cardSize));
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

export const areBillingFieldsFilled = (data: BillingData): boolean => {
  const requiredFields: (keyof BillingData)[] = [
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

export const isTimestampAfter = (timestampInSeconds: number, durationInSeconds: number) => {
  // Get current timestamp in seconds
  const nowInSeconds = Math.floor(Date.now() / 1000);

  // Calculate the timestamp for one hour ago
  const oneHourAgoInSeconds = nowInSeconds - durationInSeconds;

  // Check if the given timestamp is in the last hour
  return timestampInSeconds > oneHourAgoInSeconds;
};
