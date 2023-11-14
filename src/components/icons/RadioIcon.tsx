import React from "react";

export interface RadioIconProps {
  checked?: boolean;
  disabled?: boolean;
}

const RadioIcon: React.FC<RadioIconProps> = ({ checked, disabled }) => {
  if (checked) {
    const colors: { fill: string; stroke: string } = {
      fill: disabled ? "#CCCFD3" : "white",
      stroke: disabled ? "#999FA7" : "#3E4EEC",
    };
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="14"
          height="14"
          rx="7"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="6"
        />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.5"
        y="0.5"
        width="19"
        height="19"
        rx="9.5"
        fill={disabled ? "#E5E7E9" : "white"}
        stroke="#CCCFD3"
      />
    </svg>
  );
};

export default RadioIcon;
