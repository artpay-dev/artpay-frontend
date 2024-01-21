import React from "react";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";
import CardList from "./CardList.tsx";
import { CardSize } from "../types";
import { useData } from "../hoc/DataProvider.tsx";
import { useNavigate } from "react-router-dom";

export interface ArtworksListProps {
  items: ArtworkCardProps[];
  title?: string;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  showEmpty?: boolean;
}

const ArtworksList: React.FC<ArtworksListProps> = ({ title, items, cardSize, onSelect, showEmpty }) => {
  const data = useData();
  const navigate = useNavigate();
  const handleSelect = (item: ArtworkCardProps) => {
    data.getGallery(item.galleryId).then((gallery) => {
      navigate(`/gallerie/${gallery.shop?.slug}/opere/${item.slug}`);
    });
  };

  return (
    <CardList title={title} cardSize={cardSize} showEmpty={showEmpty}>
      {items.map((item, i) => (
        <ArtworkCard
          key={i}
          {...item}
          size={cardSize}
          onClick={() => (onSelect ? onSelect(i) : handleSelect(items[i]))}
        />
      ))}
    </CardList>
  );
};

export default ArtworksList;
