import LogoFastArtpay from "./icons/LogoFastArtpay.tsx";
import LockIcon from "./icons/custom/LockIcon.tsx";
import ShopIcon from "./icons/custom/ShopIcon.tsx";
import UserIcon from "./icons/custom/UserIcon.tsx";
import BookMarkIcon from "./icons/custom/BookMarkIcon.tsx";
import MessageIcon from "./icons/custom/MessageIcon.tsx";


const DashboardNavbar = () => {
  return (
    <header className={"fixed w-full z-50 top-6 px-2 flex justify-end"}>
      <nav className={"px-6 py-4 custom-navbar flex justify-end items-center bg-white space-x-4 "}>
        <ul className={'flex space-x-8 items-center'}>
          <li className={"flex items-center justify-center space-x-2.5"}>
            <span className={"text-secondary"}>Transazioni</span>
            <LogoFastArtpay size={'small'} />
          </li>
          <li className={"flex items-center justify-center space-x-2.5"}>
            <span className={"text-secondary"}>Caveau</span>
            <LockIcon size={'small'} />
          </li>
          <li className={"flex items-center justify-center space-x-2.5"}>
            <span className={"text-secondary"}>Carrello</span>
            <ShopIcon size={'small'} />
          </li>
        </ul>
        <ul className={"flex items-center justify-center space-x-4"}>
          <li className={'flex items-center justify-center'}>
            <UserIcon size={'small'} />
          </li>
          <li className={'flex items-center justify-center'}>
            <BookMarkIcon size={'small'} />
          </li>
          <li className={'flex items-center justify-center'}>
            <MessageIcon size={'small'} />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default DashboardNavbar;
