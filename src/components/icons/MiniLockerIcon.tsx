import React from "react";

interface MiniLockerIconProps {
  className?: string;
}

const MiniLockerIcon: React.FC<MiniLockerIconProps> = ({ className = '' }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <rect width="24" height="24" rx="4" fill="#C2C9FF" />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M7.08398 11.3333C7.08398 10.4589 7.79287 9.75 8.66732 9.75H15.334C16.2084 9.75 16.9173 10.4589 16.9173 11.3333V16.6667C16.9173 17.5411 16.2084 18.25 15.334 18.25H8.66732C7.79287 18.25 7.08398 17.5411 7.08398 16.6667V11.3333ZM8.66732 10.25C8.06901 10.25 7.58398 10.735 7.58398 11.3333V16.6667C7.58398 17.265 8.06901 17.75 8.66732 17.75H15.334C15.9323 17.75 16.4173 17.265 16.4173 16.6667V11.3333C16.4173 10.735 15.9323 10.25 15.334 10.25H8.66732Z" 
      fill="#010F22" 
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M9.08398 7.33335C9.08398 5.72252 10.3898 4.41669 12.0007 4.41669C13.6115 4.41669 14.9173 5.72252 14.9173 7.33335V10.25H9.08398V7.33335ZM12.0007 4.91669C10.666 4.91669 9.58398 5.99867 9.58398 7.33335V9.75002H14.4173V7.33335C14.4173 5.99867 13.3353 4.91669 12.0007 4.91669Z" 
      fill="#010F22" 
    />
    <ellipse cx="11.9993" cy="14" rx="1.33333" ry="1.33333" fill="#010F22" />
  </svg>
);

export default React.memo(MiniLockerIcon);