import React from "react";
import { SvgIconProps } from "@mui/material";
import Icon from "./Icon";

const ArrowLeftIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <Icon
      render={(color) => (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg">
          <g>
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M14.2998 8.00078C14.2998 8.16647 14.1655 8.30078 13.9998 8.30078L1.99981 8.30078C1.83412 8.30078 1.69981 8.16647 1.69981 8.00078C1.69981 7.8351 1.83412 7.70078 1.99981 7.70078L13.9998 7.70078C14.1655 7.70078 14.2998 7.8351 14.2998 8.00078Z"
                  fill={color} />
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M6.21194 12.2129C6.09478 12.3301 5.90483 12.3301 5.78767 12.2129L1.78767 8.21291C1.67052 8.09576 1.67052 7.90581 1.78767 7.78865L5.78767 3.78865C5.90483 3.67149 6.09478 3.67149 6.21194 3.78865C6.32909 3.90581 6.32909 4.09576 6.21194 4.21291L2.42407 8.00078L6.21194 11.7886C6.32909 11.9058 6.32909 12.0958 6.21194 12.2129Z"
                  fill={color} />
          </g>
        </svg>
      )}
      {...props}></Icon>
  );
};

export default ArrowLeftIcon;
