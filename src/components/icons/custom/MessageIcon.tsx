const sizes: Record<string, string> = {
  small: "size-8",
  medium: "size-10",
  large: "size-12",
};

const ShopIcon = ({ className = "", size = "medium" }: { className?: string; size?: string }) => {
  const sizeStyle = sizes[size];

  return (
    <div className={`relative cursor-pointer ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${sizeStyle} `}>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.2596 23.0108V26.5029L14.1994 23.0108H23.7014C24.8151 23.0108 25.6128 22.6596 26.1329 22.1251C26.6564 21.5871 27 20.7591 27 19.6179V9.73785C27 8.59154 26.6559 7.76043 26.1321 7.22087C25.6119 6.68494 24.8145 6.33333 23.7014 6.33333H8.29867C7.17611 6.33333 6.38016 6.68119 5.86373 7.21146C5.34414 7.74499 5 8.57383 5 9.73785V19.6179C5 20.7768 5.34363 21.6026 5.86289 22.1345C6.37925 22.6634 7.17554 23.0108 8.29867 23.0108H10.2596ZM28 9.73785V19.6179C28 22.3061 26.3653 24.0108 23.7014 24.0108H14.5788L10.481 27.6429C10.2512 27.8603 10.054 28 9.80889 28C9.48255 28 9.25958 27.7508 9.25958 27.3503V24.0108H8.29867C5.62667 24.0108 4 22.3343 4 19.6179V9.73785C4 7.01299 5.62667 5.33333 8.29867 5.33333H23.7014C26.3653 5.33333 28 7.0412 28 9.73785Z" fill="#010F22"/>
      </svg>
    </div>
  );
};

export default ShopIcon;
