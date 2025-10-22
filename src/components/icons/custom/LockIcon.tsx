const sizes : Record<string, string> = {
  small: "size-8",
  medium: "size-10",
  large: "size-12",
}


const LockIcon = ({className = "", size = 'medium'} : {className?: string, size?: string}) => {
  const sizeStyle = sizes[size];

  return (
    <div className={`relative cursor-pointer ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
           className={`${sizeStyle} `}>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.166626 14.6667C0.166626 12.9178 1.58439 11.5 3.33329 11.5H16.6666C18.4155 11.5 19.8333 12.9178 19.8333 14.6667V25.3333C19.8333 27.0822 18.4155 28.5 16.6666 28.5H3.33329C1.58439 28.5 0.166626 27.0822 0.166626 25.3333V14.6667ZM3.33329 12.5C2.13668 12.5 1.16663 13.4701 1.16663 14.6667V25.3333C1.16663 26.53 2.13668 27.5 3.33329 27.5H16.6666C17.8632 27.5 18.8333 26.53 18.8333 25.3333V14.6667C18.8333 13.47 17.8632 12.5 16.6666 12.5H3.33329Z" fill="#010F22"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.16663 6.66667C4.16663 3.445 6.7783 0.833332 9.99996 0.833332C13.2216 0.833332 15.8333 3.445 15.8333 6.66667V12.5H4.16663V6.66667ZM9.99996 1.83333C7.33058 1.83333 5.16663 3.99729 5.16663 6.66667V11.5H14.8333V6.66667C14.8333 3.99729 12.6693 1.83333 9.99996 1.83333Z" fill="#010F22"/>
        <ellipse cx="10" cy="20" rx="2.66667" ry="2.66667" fill="#010F22"/>
      </svg>
      {/*{cdsOrder?.status === "on-hold" && cdsOrder.created_via == "gallery_auction" && (
        <>
          <span className="bg-red-400 rounded-full size-3 block absolute top-0 right-0 z-10 animate-ping opacity-65"></span>
          <span className="bg-red-400 rounded-full size-3 block absolute top-0 right-0 z-10"></span>
        </>
      )}*/}
    </div>
  );
};

export default LockIcon;
