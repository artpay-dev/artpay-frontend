import { Navigate, useSearchParams } from "react-router-dom";

const LandingPage = () => {
  const [searchParams] = useSearchParams();
  return <Navigate to={`/acquisto-esterno?${searchParams.toString()}`} replace />;
};

export default LandingPage;
