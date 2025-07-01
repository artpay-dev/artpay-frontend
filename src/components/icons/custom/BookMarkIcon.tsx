const sizes: Record<string, string> = {
  small: "size-8",
  medium: "size-10",
  large: "size-12",
};

const ShopIcon = ({ className = "", size = "medium" }: { className?: string; size?: string }) => {
  const sizeStyle = sizes[size];

  return (
    <div className={`relative cursor-pointer ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeStyle} `}>
        <g>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9.5 8.66667C9.5 7.65414 10.3208 6.83333 11.3333 6.83333H24.6667C25.6792 6.83333 26.5 7.65414 26.5 8.66667V26.1753C26.5 27.6396 24.8681 28.513 23.6497 27.7007L18.4622 24.2424C18.1823 24.0558 17.8177 24.0558 17.5378 24.2424L12.3503 27.7007C11.1319 28.513 9.5 27.6396 9.5 26.1753V8.66667ZM11.3333 7.83333C10.8731 7.83333 10.5 8.20643 10.5 8.66667V26.1753C10.5 26.8409 11.2418 27.2379 11.7956 26.8687L16.983 23.4104C17.5989 22.9998 18.4011 22.9998 19.017 23.4104L24.2044 26.8687C24.7582 27.2379 25.5 26.8409 25.5 26.1753V8.66667C25.5 8.20643 25.1269 7.83333 24.6667 7.83333H11.3333Z"
            fill="#010F22"
          />
        </g>
        <defs>
          <rect width="32" height="32" fill="white" transform="translate(2 2)" />
        </defs>
      </svg>
    </div>
  );
};

export default ShopIcon;
