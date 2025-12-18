import { useState } from "react";
import { MainLayout } from "../layouts";
import { MainApp } from "../components/main-app";
import { Artwork } from "../../../types/artwork";

const AppArtMatch = () => {
  const [aiResults, setAiResults] = useState<Artwork[] | null>(null);

  const handleAiResults = (results: Artwork[]) => {
    setAiResults(results);
  };

  return (
    <MainLayout onAiResults={handleAiResults}>
      <div className="flex flex-col items-center justify-center w-full">
        <MainApp aiResults={aiResults} />
      </div>
    </MainLayout>
  );
};

export default AppArtMatch;