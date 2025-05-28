import CdsPayments from "../features/cdspayments";
import { useAuth } from "../hoc/AuthProvider.tsx";

const CdsPaymentsPage = () => {
  const auth = useAuth()

  if (!auth.isAuthenticated) {
    auth.login();
  }

  return <CdsPayments />;
};

export default CdsPaymentsPage;
