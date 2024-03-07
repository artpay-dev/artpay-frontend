import React, {useState} from 'react';
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";

export interface VerticalSliderProps {

}

const VerticalSlider: React.FC<VerticalSliderProps> = ({}) => {
  const theme = useTheme()

  return (<Box>
    <Grid sx={{height: "800px", background: "#E5E7E9"}} container>
      <Grid sx={{background: theme.palette.primary.main}} item>
        <img src="/artists_example.png"/>
      </Grid>
      <Grid display="flex" alignItems="center" px={6} item>
        <Box sx={{maxWidth: "240px"}} >
          <Typography variant="h1">Loren Gallo</Typography>
          <Button sx={{my:3}} variant="contained">Scopri l'artista</Button>
          <Typography variant="body1">Lorem ipsum dolor sit amet,
            consectetur adipiscing elit.</Typography>
        </Box>
      </Grid>
    </Grid>
  </Box>);
};

export default VerticalSlider;
