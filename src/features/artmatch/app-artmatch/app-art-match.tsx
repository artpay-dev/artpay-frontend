import { MainLayout } from "../layouts";
import { MainApp } from "../components/main-app";

const AppArtMatch = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center w-full">
        <MainApp />
      </div>
    </MainLayout>
  );
};

export default AppArtMatch;