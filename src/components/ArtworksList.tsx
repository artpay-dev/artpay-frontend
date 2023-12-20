import React from "react";
import ArtworkCard, { ArtworkCardProps } from "./ArtworkCard.tsx";
import CardList from "./CardList.tsx";
import { CardSize } from "../types";

export interface ArtworksListProps {
  items: ArtworkCardProps[];
  title?: string;
  cardSize?: CardSize;
  onSelect?: (index: number) => void;
  showEmpty?: boolean;
}

const ArtworksList: React.FC<ArtworksListProps> = ({ title, items, cardSize, onSelect, showEmpty }) => {
  return (
    <CardList title={title} cardSize={cardSize} showEmpty={showEmpty}>
      {items.map((item, i) => (
        <ArtworkCard key={i} {...item} size={cardSize} onClick={() => (onSelect ? onSelect(i) : null)} />
      ))}
    </CardList>
  );
};

export default ArtworksList;
