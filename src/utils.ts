import { CardSize, MetadataItem } from "./types";
import { Artwork } from "./types/artwork.ts";
import { ArtworkCardProps } from "./components/ArtworkCard.tsx";

export const getPropertyFromMetadata = (
  metadata: MetadataItem[],
  key: string,
): string => {
  const item = metadata.find((p) => p.key === key);
  if (!item) {
    return "";
  }
  return Array.isArray(item.value) ? item.value.join(" ") : item.value;
};

export const artworkToGalleryItem = (
  artwork: Artwork,
  cardSize?: CardSize,
): ArtworkCardProps => {
  return {
    id: artwork.id.toString(),
    artistName: getPropertyFromMetadata(artwork.meta_data, "author"),
    galleryName: artwork.store_name,
    price: +artwork.price,
    size: cardSize,
    title: artwork.name,
  };
};

export const artworksToGalleryItems = (
  artworks: Artwork[],
  cardSize?: CardSize,
): ArtworkCardProps[] => {
  return artworks.map((a) => artworkToGalleryItem(a, cardSize));
};
