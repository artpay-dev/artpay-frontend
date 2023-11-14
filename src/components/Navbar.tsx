import React from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Logo from "./icons/Logo";
import { Search } from "@mui/icons-material";

export interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isMobile) {
    return <></>;
  }

  return (
    <AppBar color="default" elevation={0}>
      <Box display="flex" alignItems="center" sx={{ height: "100%" }}>
        <Box sx={{ height: "24px" }}>
          <Logo />
        </Box>
        <Button
          sx={{ ml: { xs: 1, sm: 2, lg: 6 } }}
          color="inherit"
          variant="text"
        >
          Opere
        </Button>
        <Button sx={{ ml: 0 }} color="inherit" variant="text">
          Come funziona
        </Button>
        {/*<TextField sx={{flexGrow:0, ml: 1}} variant="standard" InputProps={{startAdornment: <InputAdornment position="start"><Search/></InputAdornment>}}/>*/}
        <IconButton>
          <Search />
        </IconButton>
        <Box mx={2} flexGrow={1} />
        <Link sx={{ mr: 2, minWidth: "120px" }} href="#" color="tertiary.main">
          Sei una galleria?
        </Link>
        <Button sx={{ minWidth: "150px" }} color="secondary" variant="outlined">
          Login/Registrati
        </Button>
      </Box>
    </AppBar>
  );
};

export default Navbar;
