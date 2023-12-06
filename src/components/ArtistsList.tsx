import React from "react";
import ArtistCard, { ArtistCardProps } from "./ArtistCard.tsx";
import CardList from "./CardList.tsx";

export interface ArtistsListProps {
  items: ArtistCardProps[];
  title?: string;
  onSelect?: (index: number) => void;
}

const ArtistsList: React.FC<ArtistsListProps> = ({
  items,
  title,
  onSelect,
}) => {
  return (
    <CardList title={title} cardSize="large">
      {items.map((item, i) => (
        <ArtistCard
          key={i}
          {...item}
          onClick={() => (onSelect ? onSelect(i) : null)}
        />
      ))}
    </CardList>
  );
};

export default ArtistsList;
