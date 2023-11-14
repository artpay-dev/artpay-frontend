import React from "react";

type IconSize = "small" | "medium" | "large";
export interface RadioIconProps {
  checked?: boolean;
  disabled?: boolean;
  size?: IconSize;
}

const RadioIcon: React.FC<RadioIconProps> = ({
  checked,
  disabled,
  size = "medium",
}) => {
  const sizes = {
    small: 15,
    medium: 18,
    large: 24,
  };

  const svgSize = sizes[size] || 18;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={svgSize}
      height={svgSize}
      viewBox="0 0 18 18"
      fill="none"
    >
      <g style={{ strokeWidth: 0.97994334 }}>
        <rect
          width="15"
          height="15"
          x="1"
          y="1"
          rx="2"
          ry="2"
          style={{
            fill: disabled ? "#E5E7E9" : "white",
            stroke: "#CCCFD3",
            strokeWidth: 1,
            strokeLinecap: "round",
          }}
          transform="matrix(1.04135 0 0 1 0 .343)"
        />
      </g>
      {checked && (
        <path
          d="M7.607 13.624a.463.463 0 0 0 .362-.185l5.117-7.94c.02-.039.039-.083.059-.132a.325.325 0 0 0-.083-.38.361.361 0 0 0-.25-.103c-.123 0-.234.068-.331.205l-4.883 7.607-2.696-3.144a.395.395 0 0 0-.151-.137.419.419 0 0 0-.18-.039.355.355 0 0 0-.255.103.343.343 0 0 0-.107.258c0 .091.039.192.117.303l2.91 3.399a.508.508 0 0 0 .166.141c.059.03.127.044.205.044"
          fill={disabled ? "#CCCFD3" : "#3F55E9"}
          style={{ strokeWidth: 1 }}
        />
      )}
    </svg>
  );
};

export default RadioIcon;
