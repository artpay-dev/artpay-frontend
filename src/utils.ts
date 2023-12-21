import { CardSize, MetadataItem } from "./types";
import { Artwork } from "./types/artwork.ts";
import { ArtworkCardProps } from "./components/ArtworkCard.tsx";
import { ArtistCardProps } from "./components/ArtistCard.tsx";
import { Artist } from "./types/artist.ts";
import { Gallery, GalleryContent } from "./types/gallery.ts";

export const getPropertyFromMetadata = (metadata: MetadataItem[], key: string): { [key: string]: string } => {
  const item = metadata.find((p) => p.key === key);
  if (!item) {
    return {};
  }
  return typeof item.value === "object" ? item.value : { value: item.value };
};

export const artworkToGalleryItem = (artwork: Artwork, cardSize?: CardSize): ArtworkCardProps => {
  return {
    id: artwork.id.toString(),
    artistName: getPropertyFromMetadata(artwork.meta_data, "artist")?.artist_name,
    galleryName: artwork.store_name,
    price: +artwork.price,
    size: cardSize,
    title: artwork.name,
    slug: artwork.slug,
    imgUrl: artwork?.images?.length ? artwork.images[0].src : "",
  };
};
export const artistToGalleryItem = (artist: Artist): ArtistCardProps => {
  return {
    id: artist.id.toString(),
    isFavourite: false,
    subtitle: `${artist.acf.location}, ${artist.acf.birth_year}`,
    title: artist.title?.rendered || "",
    description: artist.excerpt?.rendered || "",
    artworksCount: artist.artworks?.length || 0,
    imgUrl: artist.artworks?.length && artist.artworks[0].images?.length ? artist.artworks[0].images[0] : "",
  };
};

export const galleryToGalleryContent = (gallery: Gallery): GalleryContent => ({
  title: gallery.display_name,
  subtitle: `${gallery.address?.city}`,
  logoImage: gallery.shop?.image,
  coverImage: gallery.shop?.banner,
  categories: [],
  description: gallery.message_to_buyers,
});

export const artworksToGalleryItems = (artworks: Artwork[], cardSize?: CardSize): ArtworkCardProps[] => {
  return artworks.map((a) => artworkToGalleryItem(a, cardSize));
};

export const artistsToGalleryItems = (artists: Artist[]): ArtistCardProps[] => {
  return artists.map((a) => artistToGalleryItem(a));
};
