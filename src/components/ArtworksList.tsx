import React from "react";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";
import CardList from "./CardList.tsx";
import { CardSize } from "../types";
import { useNavigate } from "react-router-dom";

export interface ArtworksListProps {
  items: ArtworkCardProps[];
  title?: string;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  showEmpty?: boolean;
}

const ArtworksList: React.FC<ArtworksListProps> = ({
  title,
  items,
  cardSize,
  onSelect,
  showEmpty,
}) => {
  const navigate = useNavigate();
  const handleSelectArtwork = (index: number) => {
    const selectedArtwork = items[index];
    navigate(`/artwork/${selectedArtwork.id}`);
  };
  return (
    <CardList title={title} cardSize={cardSize} showEmpty={showEmpty}>
      {items.map((item, i) => (
        <ArtworkCard
          key={i}
          {...item}
          size={cardSize}
          onClick={() => (onSelect ? onSelect(i) : handleSelectArtwork(i))}
        />
      ))}
    </CardList>
  );
};

export default ArtworksList;
