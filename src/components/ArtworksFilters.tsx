import React from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import TextField from "./TextField.tsx";
import SearchIcon from "./icons/SearchIcon.tsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Checkbox from "./Checkbox.tsx";

export interface ArtworksFiltersProps {}

const ArtworksFilters: React.FC<ArtworksFiltersProps> = ({}) => {
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="body1" color="textSecondary">
          Filter by
        </Typography>
        <TextField
          sx={{ mt: 3 }}
          fullWidth
          variant="standard"
          placeholder="Search by keyword"
          InputProps={{ endAdornment: <SearchIcon fontSize="small" />, color: "primary" }}
        />
      </Box>
      <Box>
        <Accordion disableGutters elevation={0} defaultExpanded>
          <AccordionSummary sx={{ p: 0 }} expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" color="textPrimary">
              Medium / category
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, display: "flex", flexDirection: "column" }}>
            <TextField
              sx={{ mt: 0, mb: 2 }}
              fullWidth
              variant="standard"
              placeholder="Enter medium"
              InputProps={{ endAdornment: <SearchIcon fontSize="small" /> }}
            />
            <Checkbox label="Checkbox" />
            <Checkbox label="Checkbox" />
            <Checkbox label="Checkbox" />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default ArtworksFilters;
