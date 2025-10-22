import React, { ReactNode } from "react";
import { AccordionDetails, AccordionSummary, Typography, Accordion as BaseAccordion } from "@mui/material";
import PlusIcon from "./icons/PlusIcon.tsx";

export interface AccordionProps {
  title: string;
  content: string | ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, content }) => {
  return (
    <BaseAccordion>
      <AccordionSummary
        expandIcon={<PlusIcon sx={{ height: "24px", width: "24px" }} />}
        aria-controls="panel1-content"
        id="panel1-header">
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="subtitle1">{content}</Typography>
      </AccordionDetails>
    </BaseAccordion>
  );
};

export default Accordion;
