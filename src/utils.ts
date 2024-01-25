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
import { User, UserInfo } from "./types/user.ts";

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
  };
};
export const artistToGalleryItem = (artist: Artist): ArtistCardProps => {
  const imgUrl = artist?.featured_img?.length
    ? artist?.featured_img[0]
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
});

export const artworksToGalleryItems = (artworks: Artwork[], cardSize?: CardSize): ArtworkCardProps[] => {
  return artworks.map((a) => artworkToGalleryItem(a, cardSize));
};

export const artistsToGalleryItems = (artists: Artist[]): ArtistCardProps[] => {
  return artists.map((a) => artistToGalleryItem(a));
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
