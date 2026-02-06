import { ReactNode } from "react";
import { Box, Container } from "@mui/material";
import Logo from "../../../components/icons/Logo.tsx";

interface AuctionCheckoutLayoutProps {
  children: ReactNode;
}

/**
 * Simple layout for auction checkout
 * - Header with Artpay logo
 * - Main content area
 * - Responsive container
 */
const AuctionCheckoutLayout = ({ children }: AuctionCheckoutLayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 3,
          px: 2,
          bgcolor: "white",
          boxShadow: 1,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Logo />
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth="lg">{children}</Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          bgcolor: "white",
          borderTop: 1,
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Box sx={{ color: "text.secondary", fontSize: 14 }}>
          Pagamento sicuro con Artpay
        </Box>
      </Box>
    </Box>
  );
};

export default AuctionCheckoutLayout;