import LogoFastArtpay from "../../../../../components/icons/LogoFastArtpay.tsx";

const Navbar = ({handleClick} : {handleClick: () => void}) => {
  return (
    <header className={"fixed w-full z-50 top-6 px-2 max-w-2xl md:px-0"}>
      <nav className={"p-4 custom-navbar flex justify-between items-center w-full bg-white "}>
        <button className={"text-tertiary cursor-pointer underline underline-offset-3 leading-[125%]"} onClick={handleClick}>
          Torna su artpay
        </button>

        <LogoFastArtpay />
      </nav>
    </header>
  );
};

export default Navbar;