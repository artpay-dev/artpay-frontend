import { NavLink } from "react-router-dom";
import LogoFastArtpay from "../icons/LogoFastArtpay.tsx";



const Navbar = () => {
  return (
    <header className={"fixed w-full z-50 top-6 px-2 lg:px-0 md:max-w-xl lg:max-w-4xl"}>
      <nav className={"p-4 custom-navbar flex justify-between items-center w-full bg-white "}>
        <NavLink to={"/"} className={"text-tertiary underline underline-offset-3 leading-[125%]"}>
          Torna su artpay
        </NavLink>

        <LogoFastArtpay />
      </nav>
    </header>
  );
};

export default Navbar;