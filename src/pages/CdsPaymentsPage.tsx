import CdsPayments from "../features/cdspayments";

const CdsPaymentsPage = () => {
  // Permetti accesso sia a utenti autenticati che guest
  // La logica di autenticazione è gestita internamente da CdsPayments
  return <CdsPayments />;
};

export default CdsPaymentsPage;